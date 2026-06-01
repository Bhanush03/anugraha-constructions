import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";

import { env } from "../env.js";

const BUCKET_NAME = "project-image";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
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
	if (!matches) return null;

	const [, mimeType, base64] = matches;
	const extension = mimeType.split("/")[1] ?? "png";
	return {
		mimeType,
		buffer: Buffer.from(base64, "base64"),
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
	if (!parsed) return null;

	const storagePath = buildStoragePath(filename, parsed.extension);
	const client = getSupabaseClient();
	const { error } = await client.storage.from(BUCKET_NAME).upload(storagePath, parsed.buffer, {
		contentType: parsed.mimeType,
		upsert: true
	});

	if (error) {
		throw new Error(`Failed to upload image to Supabase Storage: ${error.message}`);
	}

	const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
	return data.publicUrl;
}

export async function normalizeProjectImage(imageValue: string | undefined | null, filename: string) {
	if (!imageValue) return imageValue;
	if (!imageValue.startsWith("data:")) return imageValue;

	const saved = await saveDataUrlImage(imageValue, filename);
	return saved ?? imageValue;
}