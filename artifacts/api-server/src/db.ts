import { createDatabaseClient, persistDatabase } from "../../../lib/db/dist/index.js";

import { env } from "./env.js";

export const db = await createDatabaseClient(env.DATABASE_URL);
export { persistDatabase };
