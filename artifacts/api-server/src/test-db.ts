import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

function printError(error: unknown) {
  const errorObject = error as Record<string, unknown>;
  const enumerableProperties = Object.fromEntries(Object.entries(errorObject ?? {}));

  console.error({
    error,
    code: errorObject?.code,
    severity: errorObject?.severity,
    message: errorObject instanceof Error ? errorObject.message : String(error),
    detail: errorObject?.detail,
    hint: errorObject?.hint,
    stack: errorObject instanceof Error ? errorObject.stack : undefined,
    enumerableProperties
  });
}

async function main() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(databaseUrl, {
    prepare: false
  });

  try {
    const result = await sql`SELECT current_user, current_database();`;
    console.log(result);
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  printError(error);
  process.exitCode = 1;
});