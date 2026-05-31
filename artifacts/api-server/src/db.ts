import { createDatabaseClient, persistDatabase } from "@anugraha/db";

import { env } from "./env.js";

export const db = await createDatabaseClient(env.DATABASE_URL);
export { persistDatabase };
