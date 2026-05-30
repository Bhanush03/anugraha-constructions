import fs from "fs";
import path from "path";
import { createDatabaseClient, persistDatabase } from "../../../lib/db/src/index.js";

import { env } from "./env.js";

const resolvedDbPath = path.isAbsolute(env.DATABASE_URL) ? env.DATABASE_URL : path.resolve(process.cwd(), env.DATABASE_URL);
try {
	console.info("Database resolved path:", resolvedDbPath, "exists:", fs.existsSync(resolvedDbPath));
} catch (e) {
	console.error("Error checking database path:", e);
}

export const db = await createDatabaseClient(env.DATABASE_URL);
export { persistDatabase };
