/**
 * Prints row counts for every table in the public schema, plus any rows that
 * still reference Supabase storage URLs. Used to verify the Supabase → VPS
 * migration (docs/VPS_MIGRATION_PLAN.md).
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/count-db.ts
 */
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL must be set (env or .env.local)");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const { rows: tables } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );

    console.log("table".padEnd(24), "rows".padStart(8), "supabase_urls".padStart(14));
    for (const { tablename } of tables) {
      const { rows } = await client.query<{ total: string; supabase: string }>(
        `SELECT count(*) AS total,
                count(*) FILTER (WHERE row_to_json(t)::text LIKE '%supabase.co%') AS supabase
         FROM public.${client.escapeIdentifier(tablename)} t`
      );
      console.log(tablename.padEnd(24), rows[0].total.padStart(8), rows[0].supabase.padStart(14));
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
