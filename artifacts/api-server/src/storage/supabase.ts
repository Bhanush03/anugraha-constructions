import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";

import { env } from "../env.js";

const BUCKET_NAME = env.SUPABASE_STORAGE_BUCKET.trim();
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
	if (!supabaseClient) {
		supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}

	return supabaseClient;
}

function parseDataUrl(dataUrl: string) {
	const matches = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
	if (!matches) {
		throw { status: 400, message: "invalid_image_data" };
	}

	const [, mimeType, base64] = matches;
	if (!ALLOWED_IMAGE_TYPES.has(mimeType.toLowerCase())) {
		throw { status: 400, message: "unsupported_image_type" };
	}

	const buffer = Buffer.from(base64, "base64");
	if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
		throw { status: 400, message: buffer.length ? "image_too_large" : "empty_image" };
	}

	const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] ?? "png";
	return {
		mimeType,
		buffer,
		extension
	};
}

function buildStoragePath(prefix: string, extension: string) {
	const cleanPrefix = prefix
		.trim()
		.replace(/^\/+/, "")
		.replace(/[^a-zA-Z0-9/_-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/\/+$/g, "");

	return `${cleanPrefix}-${crypto.randomUUID()}.${extension}`;
}

export async function saveDataUrlImage(dataUrl: string, filename: string) {
	if (!dataUrl || !dataUrl.startsWith("data:")) return null;

	const parsed = parseDataUrl(dataUrl);

	const storagePath = buildStoragePath(filename, parsed.extension);
	const client = getSupabaseClient();
	if (!client) {
		console.warn("supabase_not_configured: storing image data in the database");
		return dataUrl;
	}

	const uploadRes = await client.storage.from(BUCKET_NAME).upload(storagePath, parsed.buffer, {
		contentType: parsed.mimeType,
		upsert: true
	});

	if (uploadRes.error) {
		console.error("supabase_upload_failed", {
			bucket: BUCKET_NAME,
			path: storagePath,
			mimeType: parsed.mimeType,
			sizeBytes: parsed.buffer?.length,
			statusCode: (uploadRes.error as any).statusCode,
			httpStatus: (uploadRes.error as any).status,
			err: {
				message: uploadRes.error.message,
				name: (uploadRes.error as any).name,
				body: (uploadRes.error as any).body
			}
		});

		// Keep content management usable if storage is temporarily unavailable.
		// PostgreSQL text columns can safely retain the validated data URL.
		return dataUrl;
	}

	const publicUrlRes = client.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
	const publicUrl = publicUrlRes.data.publicUrl;

	if (!publicUrl) {
		console.error("supabase_get_public_url_failed", {
			bucket: BUCKET_NAME,
			path: storagePath
		});
		throw {
			status: 500,
			message: "Failed to resolve Supabase public URL",
			supabase: { bucket: BUCKET_NAME, path: storagePath }
		};
	}

	console.info("supabase_upload_ok", { bucket: BUCKET_NAME, path: storagePath, publicUrl });
	return publicUrl;
}

export async function deleteStoredImage(imageUrl: string | null | undefined) {
	if (!imageUrl) return;
	try {
		const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
		const markerIndex = imageUrl.indexOf(marker);
		if (markerIndex < 0) return;
		const storagePath = decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
		if (!storagePath) return;
		const client = getSupabaseClient();
		if (!client) return;
		const { error } = await client.storage.from(BUCKET_NAME).remove([storagePath]);
		if (error) throw new Error(error.message);
	} catch {
		// Deleting an old asset is best-effort and must not fail the content update.
	}
}

export async function normalizeProjectImage(imageValue: string | undefined | null, filename: string) {
	if (!imageValue) return imageValue;
	if (!imageValue.startsWith("data:")) return imageValue;

	const saved = await saveDataUrlImage(imageValue, filename);
	return saved ?? imageValue;
}

