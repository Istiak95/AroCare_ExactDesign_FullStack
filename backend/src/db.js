import { connect } from "@tidbcloud/serverless";

let connection = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not configured."
    );
  }

  if (!connection) {
    connection = connect({
      url: databaseUrl,
    });
  }

  return connection;
}

export async function dbPing() {
  const db = getDb();

  const rows = await db.execute(
    "SELECT 1 AS ok"
  );

  return (
    Array.isArray(rows) &&
    Number(rows[0]?.ok) === 1
  );
}
