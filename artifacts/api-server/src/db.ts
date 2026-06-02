import { createDatabaseClient, persistDatabase } from "./db/index.js";
import { env } from "./env.js";

const dbUrl = new URL(env.DATABASE_URL);

console.log("DB HOST:", dbUrl.hostname);
console.log("DB PORT:", dbUrl.port);

export const db = await createDatabaseClient(env.DATABASE_URL);
export { persistDatabase };
