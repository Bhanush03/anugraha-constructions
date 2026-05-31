import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema.js";

let cachedDatabaseUrl: string | undefined;
let cachedDatabase: any;

function createPostgresClient(databaseUrl: string) {
	const isSupabasePooler = databaseUrl.includes("pgbouncer=true") || databaseUrl.includes("supabase.co") || databaseUrl.includes(":6543");
	return postgres(databaseUrl, {
		prepare: false,
		max: isSupabasePooler ? 1 : 10,
		ssl: isSupabasePooler ? "require" : undefined
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