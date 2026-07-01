import { createDatabaseClient, persistDatabase } from "./db/index.js";
import { env } from "./env.js";

export const db = await createDatabaseClient(env.DATABASE_URL);
export { persistDatabase };
