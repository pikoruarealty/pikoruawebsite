/**
 * One-time export of the Supabase Storage `media` bucket to a local folder,
 * keeping the same paths, for copying to MEDIA_DIR on the VPS
 * (docs/VPS_MIGRATION_PLAN.md, Phase 3). Re-running skips files that already
 * exist locally with the same size, so it doubles as the cutover delta sync.
 *
 *   npx tsx scripts/export-storage.ts [outDir=media-export]
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Delete this script (and @supabase/supabase-js) once Supabase is decommissioned.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const BUCKET = "media";
const PAGE_SIZE = 1000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const outDir = path.resolve(process.argv[2] ?? "media-export");

interface Totals {
  files: number;
  bytes: number;
  downloaded: number;
  skipped: number;
  failed: string[];
}

/** Recursively walks a folder in the bucket; entries without an id are sub-folders. */
async function exportFolder(prefix: string, totals: Totals): Promise<void> {
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });

    if (error) throw new Error(`list("${prefix}") failed: ${error.message}`);
    if (!data || data.length === 0) return;

    for (const entry of data) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.id === null) {
        await exportFolder(objectPath, totals);
        continue;
      }
      if (entry.name === ".emptyFolderPlaceholder") continue;

      const size = Number(entry.metadata?.size ?? 0);
      const localPath = path.join(outDir, objectPath);
      totals.files += 1;
      totals.bytes += size;

      if (fs.existsSync(localPath) && fs.statSync(localPath).size === size) {
        totals.skipped += 1;
        continue;
      }

      const { data: blob, error: dlError } = await supabase.storage.from(BUCKET).download(objectPath);
      if (dlError || !blob) {
        console.error(`  ✗ ${objectPath}: ${dlError?.message ?? "empty response"}`);
        totals.failed.push(objectPath);
        continue;
      }

      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()));
      totals.downloaded += 1;
      console.log(`  ✓ ${objectPath}`);
    }

    if (data.length < PAGE_SIZE) return;
  }
}

async function main() {
  console.log(`Exporting bucket "${BUCKET}" → ${outDir}`);
  const totals: Totals = { files: 0, bytes: 0, downloaded: 0, skipped: 0, failed: [] };

  await exportFolder("", totals);

  console.log("\nDone.");
  console.log(`  objects in bucket: ${totals.files} (${(totals.bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  downloaded: ${totals.downloaded}, already present: ${totals.skipped}, failed: ${totals.failed.length}`);
  if (totals.failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
