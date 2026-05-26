import fs from "fs";
import path from "path";
import { createRequire } from "module";

import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";

import * as schema from "./schema.js";

let cachedDatabaseUrl: string | undefined;
let cachedDatabase: any;
let sqlJsModule: any;

const require = createRequire(import.meta.url);
const sqlJsWasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");

async function getSqlJs() {
  if (!sqlJsModule) {
    sqlJsModule = await initSqlJs({
      locateFile: (fileName: string) => path.join(path.dirname(sqlJsWasmPath), fileName)
    });
  }
  return sqlJsModule;
}

export async function createDatabaseClient(databaseUrl: string) {
  const resolvedPath = path.isAbsolute(databaseUrl) ? databaseUrl : path.resolve(process.cwd(), databaseUrl);

  if (!cachedDatabase || cachedDatabaseUrl !== resolvedPath) {
    cachedDatabaseUrl = resolvedPath;
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    const SQL = await getSqlJs();
    cachedDatabase = fs.existsSync(resolvedPath) ? new SQL.Database(fs.readFileSync(resolvedPath)) : new SQL.Database();
  }

  return drizzle(cachedDatabase, { schema });
}

export function persistDatabase() {
  if (!cachedDatabase || !cachedDatabaseUrl) return;
  fs.writeFileSync(cachedDatabaseUrl, Buffer.from(cachedDatabase.export()));
}

export type DatabaseClient = Awaited<ReturnType<typeof createDatabaseClient>>;
