import "server-only";

import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

// Return timestamps as strings (the shape PostgREST returned) instead of Date
// objects — mappers and `updated_at` handling across the app expect strings.
types.setTypeParser(1184, (v) => v); // timestamptz
types.setTypeParser(1114, (v) => v); // timestamp

const globalForDb = globalThis as unknown as { pgPool?: Pool };

function getPool(): Pool {
  if (!globalForDb.pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("Missing required environment variable: DATABASE_URL");
    // Cached on globalThis so dev-mode HMR doesn't open a new pool per reload.
    globalForDb.pgPool = new Pool({ connectionString, max: 10 });
  }
  return globalForDb.pgPool;
}

// Default row type matches the untyped rows the app's mappers already consume.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export async function query<T extends QueryResultRow = AnyRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = AnyRow>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Runs `fn` inside BEGIN/COMMIT, rolling back on any thrown error. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * INSERT ... ON CONFLICT (conflictKey) DO UPDATE for a row object. Column names
 * come only from the keys of `row`, which callers build from fixed literals —
 * never pass user-controlled keys. Undefined values are omitted so DB defaults
 * (e.g. gen_random_uuid()) apply on insert. Columns listed in `jsonColumns`
 * are serialized as JSON; arrays elsewhere are sent as Postgres text[].
 */
export async function upsert(
  table: string,
  row: Record<string, unknown>,
  { conflictKey = "id", jsonColumns = [] }: { conflictKey?: string; jsonColumns?: string[] } = {}
): Promise<void> {
  const entries = Object.entries(row).filter(([, v]) => v !== undefined);
  const columns = entries.map(([k]) => k);
  const values = entries.map(([k, v]) => (jsonColumns.includes(k) ? toJson(v) : v));
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const updates = columns
    .filter((c) => c !== conflictKey)
    .map((c) => `${c} = EXCLUDED.${c}`);

  const conflictClause = columns.includes(conflictKey)
    ? updates.length > 0
      ? ` ON CONFLICT (${conflictKey}) DO UPDATE SET ${updates.join(", ")}`
      : ` ON CONFLICT (${conflictKey}) DO NOTHING`
    : "";

  await query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})${conflictClause}`,
    values
  );
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Serializes a value for a jsonb parameter; null stays SQL NULL. */
export function toJson(v: unknown): string | null {
  return v === null || v === undefined ? null : JSON.stringify(v);
}
