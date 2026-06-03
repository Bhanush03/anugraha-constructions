import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema.js";

let cachedDatabaseUrl: string | undefined;
let cachedDatabase: any;

function createPostgresClient(databaseUrl: string) {
	const isSupabasePooler =
		databaseUrl.includes("pgbouncer=true") ||
		databaseUrl.includes("supabase.co") ||
		databaseUrl.includes("supabase.com") ||
		databaseUrl.includes("pooler") ||
		databaseUrl.includes(":6543");
	const connectionUrl = new URL(databaseUrl);
	if (!connectionUrl.searchParams.has("options")) {
		connectionUrl.searchParams.set("options", "-c search_path=public");
	}

	return postgres(connectionUrl.toString(), {
		prepare: false,
		max: isSupabasePooler ? 6 : 10,
		ssl: isSupabasePooler
			? {
				rejectUnauthorized: false
			}
			: undefined,
	});
}

export async function createDatabaseClient(databaseUrl: string) {
	const resolvedUrl = databaseUrl.trim();

	if (!cachedDatabase || cachedDatabaseUrl !== resolvedUrl) {
		cachedDatabaseUrl = resolvedUrl;
		cachedDatabase = drizzle(createPostgresClient(resolvedUrl), { schema });
	}

	return cachedDatabase;
}

export function persistDatabase() {
	return undefined;
}

export type DatabaseClient = Awaited<ReturnType<typeof createDatabaseClient>>;
