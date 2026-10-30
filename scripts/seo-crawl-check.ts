/**
 * Crawls every URL in the sitemaps of a running site and checks the SEO
 * basics, then writes a CSV snapshot. Read-only (GET requests only).
 *
 *   npx tsx scripts/seo-crawl-check.ts --base http://127.0.0.1:3000          # local build
 *   npx tsx scripts/seo-crawl-check.ts --base https://www.pikorua.in --skip-combos --concurrency 2 --out baseline.csv
 *
 * Errors (exit 1): a sitemap URL that isn't 200, isn't self-canonical, is
 * noindex (meta tag or X-Robots-Tag header), has JSON-LD that doesn't parse,
 * carries retired/self-serving schema site-wide (SearchAction, aggregateRating
 * on the business node), or marks up FAQ questions or answers that aren't
 * visible on the page. Sitemap errors (also exit 1): a child sitemap that
 * isn't 200 or has no URLs, a sitemap file listed as a page in a <urlset>,
 * or a URL listed more than once across all sitemaps.
 * Warnings: title over 65 characters, description outside 70–165, H1 count ≠ 1.
 */

import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const arg = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = arg("base", "http://127.0.0.1:3000").replace(/\/$/, "");
const CANONICAL_HOST = arg("canonical-host", "https://www.pikorua.in");
const CONCURRENCY = Number(arg("concurrency", "6"));
const OUT = arg("out", "");
const SKIP_COMBOS = args.includes("--skip-combos");

interface Row {
  url: string;
  status: number;
  canonical: string;
  noindex: boolean;
  title: string;
  titleLength: number;
  descriptionLength: number;
  h1Count: number;
  jsonLdTypes: string;
  errors: string[];
  warnings: string[];
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

async function get(url: string): Promise<{ status: number; body: string; xRobots: string }> {
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "pikorua-seo-crawl-check" } });
    const xRobots = res.headers.get("x-robots-tag") ?? "";
    return { status: res.status, body: res.status === 200 ? await res.text() : "", xRobots };
  } catch {
    return { status: 0, body: "", xRobots: "" };
  }
}

const toLocal = (url: string) => url.replace(CANONICAL_HOST, BASE);
const locs = (xml: string) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));

function collectJsonLdNodes(value: unknown, out: Record<string, unknown>[]) {
  if (Array.isArray(value)) value.forEach((v) => collectJsonLdNodes(v, out));
  else if (value && typeof value === "object") {
    const node = value as Record<string, unknown>;
    if (node["@type"]) out.push(node);
    if (node["@graph"]) collectJsonLdNodes(node["@graph"], out);
  }
}

function checkPage(url: string, status: number, html: string, xRobots = ""): Row {
  const errors: string[] = [];
  const warnings: string[] = [];
  const canonical = decode(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "");
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").trim();
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;

  if (status !== 200) errors.push(`status ${status}`);
  if (status === 200) {
    if (canonical !== url) errors.push(`canonical ${canonical || "missing"}`);
    if (/noindex/.test(robots)) errors.push("noindex in sitemap");
    if (/noindex/i.test(xRobots)) errors.push("X-Robots-Tag noindex in sitemap");
    if (title.length > 65) warnings.push(`title ${title.length} chars`);
    if (description.length < 70 || description.length > 165) warnings.push(`description ${description.length} chars`);
    if (h1Count !== 1) warnings.push(`${h1Count} h1`);
  }

  const visibleText = decode(
    html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ");
  const nodes: Record<string, unknown>[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      collectJsonLdNodes(JSON.parse(m[1]), nodes);
    } catch {
      errors.push("JSON-LD does not parse");
    }
  }
  const types = new Set(nodes.flatMap((n) => [n["@type"]].flat().map(String)));
  if (nodes.some((n) => (n as { potentialAction?: { "@type"?: string } }).potentialAction?.["@type"] === "SearchAction")) {
    errors.push("SearchAction (retired)");
  }
  const businessRated = nodes.some((n) => [n["@type"]].flat().includes("RealEstateAgent") && n.aggregateRating);
  if (businessRated && !url.endsWith("/testimonials")) errors.push("aggregateRating on business node");
  const isVisible = (text: string) => visibleText.includes(decode(text).replace(/\s+/g, " ").trim().slice(0, 60));
  for (const n of nodes.filter((x) => x["@type"] === "FAQPage")) {
    const questions = (n.mainEntity as { name: string; acceptedAnswer?: { text?: string } }[]) ?? [];
    const hidden = questions.filter((q) => !isVisible(q.name));
    if (hidden.length) errors.push(`${hidden.length} FAQ question(s) marked up but not visible`);
    const hiddenAnswers = questions.filter((q) => q.acceptedAnswer?.text && !isVisible(q.acceptedAnswer.text));
    if (hiddenAnswers.length) errors.push(`${hiddenAnswers.length} FAQ answer(s) marked up but not visible`);
  }

  return {
    url, status, canonical, noindex: /noindex/.test(robots), title, titleLength: title.length,
    descriptionLength: description.length, h1Count, jsonLdTypes: [...types].sort().join(" "), errors, warnings,
  };
}

async function main() {
  const index = await get(`${BASE}/sitemap/index.xml`);
  const core = await get(`${BASE}/sitemap.xml`);
  if (core.status !== 200 || index.status !== 200) {
    console.error(`Sitemaps not reachable at ${BASE} (sitemap.xml ${core.status}, sitemap/index.xml ${index.status}).`);
    process.exit(1);
  }
  const sitemapErrors: string[] = [];
  const children = locs(index.body).filter((u) => !(SKIP_COMBOS && /\/sitemap\/p-\d+\.xml$/.test(u)));
  if (!children.length) sitemapErrors.push("sitemap/index.xml lists no child sitemaps");
  // Raw entries, before de-duplication, so a URL listed twice is reported.
  const entries: { url: string; sitemap: string }[] = [];
  const addEntries = (sitemap: string, xml: string) => {
    if (!/<urlset[\s>]/.test(xml)) sitemapErrors.push(`${sitemap} is not a <urlset>`);
    const found = locs(xml);
    if (!found.length) sitemapErrors.push(`${sitemap} lists no URLs`);
    for (const url of found) {
      if (/\.xml$/.test(new URL(url).pathname)) sitemapErrors.push(`${sitemap} lists a sitemap file as a page: ${url}`);
      entries.push({ url, sitemap });
    }
  };
  addEntries("sitemap.xml", core.body);
  for (const child of children) {
    const sm = await get(toLocal(child));
    if (sm.status !== 200) {
      sitemapErrors.push(`${child} returned ${sm.status}`);
      continue;
    }
    addEntries(child.replace(CANONICAL_HOST, ""), sm.body);
  }
  const seen = new Map<string, string>();
  for (const { url, sitemap } of entries) {
    const first = seen.get(url);
    if (first) sitemapErrors.push(`duplicate URL ${url} (in ${first} and ${sitemap})`);
    else seen.set(url, sitemap);
  }
  const urls = new Set(seen.keys());

  const queue = [...urls];
  const rows: Row[] = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        const page = await get(toLocal(url));
        rows.push(checkPage(url, page.status, page.body, page.xRobots));
      }
    })
  );
  rows.sort((a, b) => a.url.localeCompare(b.url));

  if (OUT) {
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["url", "status", "canonical", "noindex", "title", "title_length", "description_length", "h1_count", "jsonld_types", "errors", "warnings"];
    const lines = rows.map((r) =>
      [r.url, r.status, r.canonical, r.noindex, r.title, r.titleLength, r.descriptionLength, r.h1Count, r.jsonLdTypes, r.errors.join("; "), r.warnings.join("; ")].map(esc).join(",")
    );
    writeFileSync(OUT, [header.join(","), ...lines].join("\n") + "\n");
  }

  const failed = rows.filter((r) => r.errors.length);
  const warned = rows.filter((r) => r.warnings.length);
  for (const e of sitemapErrors.slice(0, 40)) console.log(`SITEMAP ERROR ${e}`);
  for (const r of failed.slice(0, 40)) console.log(`ERROR ${r.url}: ${r.errors.join("; ")}`);
  for (const r of warned.slice(0, 15)) console.log(`warn  ${r.url}: ${r.warnings.join("; ")}`);
  console.log(
    `\n${children.length + 1} sitemaps, ${entries.length} entries, ${rows.length} unique URLs checked at ${BASE}${SKIP_COMBOS ? " (combo sitemaps skipped)" : ""}: ${sitemapErrors.length} sitemap errors, ${failed.length} URLs with errors, ${warned.length} with warnings.${OUT ? ` Snapshot: ${OUT}` : ""}`
  );
  process.exit(failed.length || sitemapErrors.length ? 1 : 0);
}

main();
