/**
 * Runs the automated-blog quality gate (src/lib/ai/blogQuality.ts) over the
 * AI drafts already in the database and prints what it would decide for
 * each. Read-only: nothing is published, changed or deleted.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/blog-backlog-audit.ts
 *
 * The source article text of old drafts wasn't stored, so every specific
 * figure in them counts as unsupported — the figure check is reported but
 * left out of the decision here.
 */
import { Client, types } from "pg";
import dotenv from "dotenv";
import { evaluateDraft, htmlToText, type ExistingPostRef } from "../src/lib/ai/blogQuality";
import { getRenderablePublicPaths } from "../src/lib/data/public-routes";

dotenv.config({ path: ".env.local" });
// Timestamps as strings, as src/lib/db.ts does.
types.setTypeParser(1184, (v) => v);

interface BlogRow {
  id: string; slug: string; title: string; category: string; html_content: string | null; content: string[] | null;
  seo_title: string | null; seo_description: string | null; excerpt: string; faqs: unknown;
  is_active: boolean; pending_review: boolean; source: string; created_at: string;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL must be set (env or .env.local)");
    process.exit(1);
  }
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const { rows } = await client.query<BlogRow>("SELECT * FROM blogs ORDER BY created_at");
    const knownPaths = getRenderablePublicPaths();
    const tally: Record<string, number> = {};

    for (const row of rows.filter((r) => r.source === "ai_auto")) {
      // Compare only against posts that existed before this draft.
      const earlier: ExistingPostRef[] = rows
        .filter((r) => r.id !== row.id && r.created_at < row.created_at)
        .map((r) => ({ id: r.id, slug: r.slug, title: r.title, text: r.html_content ? htmlToText(r.html_content) : (r.content ?? []).join(" ") }));

      const gate = evaluateDraft({
        raw: {
          title: row.title, slug: row.slug, category: row.category, htmlContent: row.html_content ?? "",
          seoTitle: row.seo_title ?? "", seoDescription: row.seo_description ?? "", excerpt: row.excerpt, faqs: row.faqs,
        },
        sourceText: "",
        existing: earlier,
        knownPaths,
      });
      const reasons = gate.reasons.filter((r) => !/figures not found in the source/.test(r));
      const decision = gate.decision === "hold" && reasons.length === 0 ? "publish" : gate.decision;
      tally[decision] = (tally[decision] ?? 0) + 1;

      const state = row.pending_review ? "PENDING" : row.is_active ? "LIVE" : "INACTIVE";
      console.log(`\n[${decision.toUpperCase()}] (${state}, ${row.created_at.slice(0, 10)}) /blog/${row.slug}`);
      console.log(`  words=${gate.metrics.words} h2=${gate.metrics.h2} links=${gate.metrics.internalLinks} removed=${gate.metrics.linksRemoved.length} rewritten=${gate.metrics.linksRewritten.length} figures(no source)=${gate.metrics.unsupportedFigures.length} seoTitle=${row.seo_title?.length ?? 0}ch`);
      for (const r of reasons) console.log(`  - ${r}`);
    }

    console.log(`\nGate decisions for ${Object.values(tally).reduce((a, b) => a + b, 0)} AI drafts:`, tally);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
