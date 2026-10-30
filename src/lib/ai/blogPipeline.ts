import "server-only";

import { query, queryOne, errorMessage, toJson } from "@/lib/db";
import { STATIC_BLOG_POSTS } from "@/lib/data/blog";
import { getRenderableGeoPages, getRenderablePublicPaths } from "@/lib/data/public-routes";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";
import { getRelatedLandingPagesForText } from "@/lib/data/geo";
import { pickPlaceholderCover } from "@/lib/data/blogPlaceholders";
import { submitToIndexNow } from "@/lib/index-now";
import { revalidateBlogPaths } from "@/lib/blog-revalidation";
import { SITE_URL } from "@/lib/seo";
import {
  PILLAR_ROTATION,
  draftBlogFromNews,
  fetchRealEstateNews,
  reviseBlogDraft,
  type NewsItem,
  type NewsPillar,
} from "@/lib/ai/blogAutomation";
import {
  AUTOMATED_BYLINE,
  BLOG_CATEGORIES,
  MIN_INTERNAL_LINKS,
  autoPublishBlockers,
  evaluateDraft,
  finalizeForAutoPublish,
  findTopicDuplicate,
  keyNumbersHtml,
  htmlToText,
  type ExistingPostRef,
  type GateResult,
  type ParsedBlogDraft,
} from "@/lib/ai/blogQuality";
import {
  BRIEF_SOURCE_PREFIX,
  briefFactsText,
  briefToSourceText,
  pickNextBrief,
  type EditorialBrief,
} from "@/lib/ai/blogTopicQueue";

/**
 * Unattended blog pipeline: pick a fresh, relevant headline for the next
 * editorial pillar, draft a post, run the quality gate, then publish it or
 * hold it for review.
 *
 * Publishing is controlled by BLOG_AUTOPUBLISH:
 *  - unset/false (default): every draft that passes the gate is saved as
 *    pending review — the original Akshat-era behaviour.
 *  - "true" (management decision, 30 Oct 2026): nothing waits for a person.
 *    A flagged draft gets one AI revision pass, then any sentence that is
 *    still risky (guaranteed-return wording, a figure not in the source) is
 *    removed, and the post goes live with topic disclaimers rendered on the
 *    page (src/lib/data/blog-disclaimers.ts). A draft that can't be fixed
 *    is discarded and the next headline is tried. What was changed is kept
 *    in review_notes.
 * Either way a published post can be taken down from /admin (Inactive).
 *
 * Every run is logged in blog_automation_runs (migration 014). An admin can
 * pause scheduled runs until a date or indefinitely (migration 015, /admin →
 * Blogs); a paused run is logged as skipped.
 *
 * A dry run (trigger "dry-run") does everything except save: it exists to
 * verify the real AI integration on the server. It saves no post and doesn't
 * use up the headline or brief it drafted.
 */

/**
 * Run order. News pillars come from Google News; "evergreen" slots draft the
 * next brief in src/lib/ai/blogTopicQueue.ts (NRI guides, locality guides,
 * investor how-tos). Either kind falls back to the other when it has nothing.
 */
type RunSlot = NewsPillar | "evergreen";
const RUN_ROTATION: RunSlot[] = [
  "luxury-residential",
  "nri",
  "evergreen",
  "investment-commercial",
  "nri",
  "evergreen",
  "luxury-residential",
  "infrastructure",
];

/** A run in progress longer than this is treated as crashed. */
const STALE_RUN_MINUTES = 15;
/** Minimum gap between successful runs, so a duplicate trigger is a no-op. */
const MIN_HOURS_BETWEEN_RUNS = 20;
/** Headlines drafted per run before giving up (each one is an AI call). */
const MAX_DRAFT_ATTEMPTS = 3;

export type AutoBlogStatus = "published" | "held" | "skipped" | "failed";

export interface AutoBlogResult {
  status: AutoBlogStatus;
  reason: string;
  runId?: number;
  blogId?: string;
  slug?: string;
  title?: string;
  pillar?: RunSlot;
  /** Dry runs only: what would have been saved. */
  preview?: { decision: GateResult["decision"]; reasons: string[]; warnings: string[]; excerpt: string; words: number; model: string; usage: unknown };
}

export function isAutoPublishEnabled(): boolean {
  return process.env.BLOG_AUTOPUBLISH === "true";
}

interface Attempt {
  headline: string;
  link: string;
  outcome: string;
}

/** Something to draft from: a news story or an editorial brief. */
type Candidate =
  | { kind: "news"; title: string; key: string; item: NewsItem }
  | { kind: "brief"; title: string; key: string; brief: EditorialBrief };

const briefCandidate = (brief: EditorialBrief): Candidate => ({
  kind: "brief", title: brief.title, key: BRIEF_SOURCE_PREFIX + brief.id, brief,
});

export async function runAutoBlog({
  trigger = "cron",
  force = false,
  dryRun = false,
}: { trigger?: string; force?: boolean; dryRun?: boolean } = {}): Promise<AutoBlogResult> {
  await query(
    `UPDATE blog_automation_runs
        SET status = 'failed', finished_at = now(), reason = 'Expired: run did not finish'
      WHERE status = 'running' AND started_at < now() - ($1 || ' minutes')::interval`,
    [String(STALE_RUN_MINUTES)]
  );

  if (!dryRun) {
    // Throws if migration 015 is missing, so a missing pause table never
    // means "not paused".
    const pause = await getAutoBlogPause();
    if (pause.paused) {
      const reason = `Paused by admin ${pause.pausedUntil === "infinity" ? "until resumed" : `until ${pause.pausedUntil}`}.`;
      await query(
        "INSERT INTO blog_automation_runs (trigger, status, reason, finished_at) VALUES ($1, 'skipped', $2, now())",
        [trigger, reason]
      );
      return { status: "skipped", reason };
    }
  }

  if (!force && !dryRun) {
    const recent = await queryOne(
      `SELECT id FROM blog_automation_runs
        WHERE status IN ('published', 'held') AND started_at > now() - ($1 || ' hours')::interval
        LIMIT 1`,
      [String(MIN_HOURS_BETWEEN_RUNS)]
    );
    if (recent) {
      return { status: "skipped", reason: `A run already produced a post in the last ${MIN_HOURS_BETWEEN_RUNS} hours.` };
    }
  }

  const done = await queryOne<{ n: string }>(
    "SELECT count(*) AS n FROM blog_automation_runs WHERE status IN ('published', 'held')"
  );
  const pillar = RUN_ROTATION[Number(done?.n ?? 0) % RUN_ROTATION.length];

  let runId: number;
  try {
    const row = await queryOne<{ id: string }>(
      "INSERT INTO blog_automation_runs (trigger, pillar) VALUES ($1, $2) RETURNING id",
      [dryRun ? "dry-run" : trigger, pillar]
    );
    runId = Number(row!.id);
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { status: "skipped", reason: "Another run is in progress." };
    }
    throw err;
  }

  try {
    const result = await executeRun(runId, pillar, dryRun);
    return { pillar, ...result, runId };
  } catch (err) {
    const reason = `Unhandled error: ${errorMessage(err)}`;
    console.error("[auto-blog]", reason);
    await finishRun(runId, "failed", reason, {});
    return { status: "failed", reason, runId, pillar };
  }
}

async function executeRun(runId: number, slot: RunSlot, dryRun: boolean): Promise<AutoBlogResult> {
  const existingRows = await query<{
    id: string; slug: string; title: string; html_content: string | null; content: string[] | null; source_url: string | null;
  }>("SELECT id, slug, title, html_content, content, source_url FROM blogs");
  // Headlines drafted in earlier runs. Rejected attempts count too (a
  // duplicate stays a duplicate); generation failures don't, so a headline
  // hit by an outage is tried again next time.
  const recentRuns = await query<{ id: string; source_url: string | null; source_title: string | null; attempts: Attempt[] | null }>(
    `SELECT id, source_url, source_title, checks->'attempts' AS attempts FROM blog_automation_runs
      WHERE started_at > now() - interval '120 days'`
  );
  const recentSources = recentRuns.flatMap((r) => [
    ...(r.source_title ? [{ id: r.id, source_url: r.source_url, source_title: r.source_title }] : []),
    ...(r.attempts ?? [])
      .filter((a) => a.outcome.startsWith("reject"))
      .map((a) => ({ id: r.id, source_url: a.link, source_title: a.headline })),
  ]);

  const dbSlugs = new Set(existingRows.map((r) => r.slug));
  const existing: ExistingPostRef[] = [
    ...existingRows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      text: r.html_content ? htmlToText(r.html_content) : (r.content ?? []).join(" "),
    })),
    ...STATIC_BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({
      id: p.id, slug: p.slug, title: p.title, text: p.content.join(" "),
    })),
  ];
  // Headlines already drafted (even if the draft was rejected) — compared by
  // topic so the same story from a different outlet isn't drafted again.
  const pastHeadlines: ExistingPostRef[] = recentSources.map((r) => ({
    id: `run-${r.id}`, slug: "", title: r.source_title!,
  }));
  const usedUrls = new Set(
    [...existingRows.map((r) => r.source_url), ...recentSources.map((r) => r.source_url)].filter(Boolean) as string[]
  );

  // 1. Find something fresh to draft: the scheduled slot first, then the
  //    other news pillars, then the editorial queue (or the reverse order for
  //    an evergreen slot).
  const nextBrief = pickNextBrief(usedUrls, existing);
  const newsOrder = [
    ...(slot === "evergreen" ? [] : [slot]),
    ...PILLAR_ROTATION.filter((p, i, all) => p !== slot && all.indexOf(p) === i),
  ];
  let pillar: RunSlot = slot;
  let candidates: Candidate[] = slot === "evergreen" && nextBrief ? [briefCandidate(nextBrief)] : [];
  const feedErrors: string[] = [];
  for (const p of candidates.length ? [] : newsOrder) {
    const news = await fetchRealEstateNews(p);
    if (!news.success) {
      feedErrors.push(`${p}: ${news.error}`);
      continue;
    }
    candidates = news.items
      .filter(
        (item) =>
          !usedUrls.has(item.link) &&
          !findTopicDuplicate(item.title, existing) &&
          !findTopicDuplicate(item.title, pastHeadlines)
      )
      .map((item): Candidate => ({ kind: "news", title: item.title, key: item.link, item }));
    if (candidates.length) {
      pillar = p;
      break;
    }
  }
  if (!candidates.length && nextBrief) {
    candidates = [briefCandidate(nextBrief)];
    pillar = "evergreen";
  }
  if (pillar !== slot) await query("UPDATE blog_automation_runs SET pillar = $2 WHERE id = $1", [runId, pillar]);
  if (!candidates.length) {
    const allFeedsFailed = feedErrors.length === newsOrder.length;
    const reason = feedErrors.length
      ? `No usable headlines or briefs (feed errors: ${feedErrors.join("; ")}).`
      : "No fresh headlines and the editorial queue is used up.";
    await finishRun(runId, allFeedsFailed ? "failed" : "skipped", reason, { pillar });
    return { status: allFeedsFailed ? "failed" : "skipped", reason, pillar };
  }

  // 2. Draft and gate, trying the next headline if one fails or is rejected.
  const knownPaths = getRenderablePublicPaths();
  const attempts: Attempt[] = [];
  // Dry-run attempts are labelled so a later real run doesn't treat their
  // rejects as already-seen headlines.
  const label = (outcome: string) => (dryRun ? `dry-run ${outcome}` : outcome);
  const autopublish = isAutoPublishEnabled();
  let accepted: {
    candidate: Candidate; gate: GateResult; model: string; usage: unknown; resolvedUrl: string;
    /** Auto-publish only: the fixed draft and what was changed. */
    fixed?: { draft: ParsedBlogDraft; notes: string[] };
  } | null = null;
  for (const candidate of candidates.slice(0, MAX_DRAFT_ATTEMPTS)) {
    const generation = candidate.kind === "news"
      ? await draftBlogFromNews(candidate.item.title, candidate.item.link, undefined, pillar === "evergreen" ? undefined : pillar)
      : await draftBlogFromNews(candidate.brief.title, undefined, briefToSourceText(candidate.brief), undefined, {
          angle: candidate.brief.angle,
          extraLinks: [{ topic: candidate.brief.targetQuery, href: candidate.brief.linkTo }],
        });
    if (!generation.success) {
      attempts.push({ headline: candidate.title, link: candidate.key, outcome: label(`generation failed: ${generation.error}`) });
      // A missing key or exhausted credits won't fix itself on the next headline.
      if (/OPENROUTER_API_KEY|401|402|403/.test(generation.error)) break;
      continue;
    }
    const sourceText = candidate.kind === "brief" ? briefFactsText(candidate.brief) : generation.generation.sourceText;
    let gate = evaluateDraft({ raw: generation.generation.raw, sourceText, existing, knownPaths });
    if (!dryRun) {
      await query("UPDATE blog_automation_runs SET source_url = $2, source_title = $3 WHERE id = $1", [runId, candidate.key, candidate.title]);
    }
    const base = { candidate, model: generation.generation.model, usage: generation.generation.usage, resolvedUrl: generation.generation.resolvedUrl };

    if (autopublish) {
      // One revision pass for what a disclaimer can't cure, then remove
      // whatever is still risky; publish or discard — never hold.
      const blockers = autoPublishBlockers(gate);
      if (gate.decision !== "reject" && blockers.length) {
        const revision = await reviseBlogDraft(generation.generation.raw, blockers, sourceText);
        if (revision.success) {
          const revised = evaluateDraft({ raw: revision.raw, sourceText, existing, knownPaths });
          if (revised.decision !== "reject" && autoPublishBlockers(revised).length <= blockers.length) gate = revised;
        }
      }
      const final = finalizeForAutoPublish(gate, sourceText, knownPaths);
      attempts.push({
        headline: candidate.title, link: candidate.key,
        outcome: label(final.ok ? `publish (auto): ${final.notes.join(" ") || "all checks passed"}` : `reject (auto): ${final.reason}`),
      });
      if (final.ok) {
        accepted = { ...base, gate, fixed: { draft: final.draft, notes: final.notes } };
        break;
      }
      continue;
    }

    if (candidate.kind === "brief" && candidate.brief.alwaysHold && gate.decision === "publish") {
      gate.decision = "hold";
      gate.reasons.push("Editorial brief marked for human review (regulated or lifestyle topic).");
    }
    attempts.push({ headline: candidate.title, link: candidate.key, outcome: label(`${gate.decision}: ${gate.reasons.join(" ") || "all checks passed"}`) });
    if (gate.decision !== "reject") {
      accepted = { ...base, gate };
      break;
    }
  }

  if (!accepted || !accepted.gate.draft) {
    const allFailed = attempts.every((a) => a.outcome.includes("generation failed"));
    const reason = allFailed
      ? `Draft generation failed: ${attempts.map((a) => a.outcome).join(" | ")}`
      : `All drafts rejected by the quality gate: ${attempts.map((a) => a.outcome).join(" | ")}`;
    await finishRun(runId, allFailed ? "failed" : "skipped", reason, { pillar, attempts });
    return { status: allFailed ? "failed" : "skipped", reason, pillar };
  }

  // 3. Save: publish, or hold for review with the reasons.
  const { candidate, gate, model, usage, resolvedUrl, fixed } = accepted;
  const draft = fixed?.draft ?? gate.draft!;

  if (dryRun) {
    const reason = fixed
      ? `Dry run: would publish "${draft.title}". ${fixed.notes.join(" ")}`.trim()
      : `Dry run: would ${gate.decision === "publish" && autopublish ? "publish" : "hold"} "${draft.title}". ${gate.reasons.join(" ")}`.trim();
    await finishRun(runId, "skipped", reason, { pillar, attempts, gate: summarizeGate(gate), dryRun: true }, { model, usage });
    return {
      status: "skipped", reason, pillar, slug: draft.slug, title: draft.title,
      preview: { decision: fixed ? "publish" : gate.decision, reasons: fixed ? fixed.notes : gate.reasons, warnings: gate.warnings, excerpt: draft.excerpt, words: gate.metrics.words, model, usage },
    };
  }
  const publish = fixed ? true : gate.decision === "publish" && autopublish;
  const reviewNotes = fixed
    ? fixed.notes.join("\n") || null
    : gate.decision === "hold"
      ? gate.reasons.join("\n")
      : autopublish ? null : "Passed every automated check. Auto-publish is off (BLOG_AUTOPUBLISH), so it awaits approval.";
  const sourceLabel = candidate.kind === "news" ? candidate.item.source : candidate.brief.sources.map((src) => src.label).join("; ");
  const bodyHtml = keyNumbersHtml(draft.keyNumbers, sourceLabel) + withRelatedLinks(draft);

  const id = "blog-auto-" + Date.now().toString(36);
  const row = {
    id,
    slug: draft.slug,
    title: draft.title,
    category: draft.category,
    category_label: BLOG_CATEGORIES[draft.category],
    published_at: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    read_time: `${Math.max(3, Math.round(gate.metrics.words / 220))} min read`,
    excerpt: draft.excerpt,
    // Never a scraped publisher image: we don't hold rights to it.
    cover_image: pickPlaceholderCover(draft.slug),
    author_name: AUTOMATED_BYLINE.name,
    author_role: AUTOMATED_BYLINE.role,
    author_avatar: AUTOMATED_BYLINE.avatar,
    html_content: bodyHtml + (candidate.kind === "news"
      ? sourceAttribution(candidate.item, resolvedUrl)
      : briefAttribution(candidate.brief, draft.htmlContent)),
    faqs: draft.faqs,
    seo_title: draft.seoTitle,
    seo_description: draft.seoDescription,
    is_active: publish,
    pending_review: !publish,
    review_notes: reviewNotes,
    source_url: candidate.key,
  };

  let saved = false;
  for (let i = 0; i < 2 && !saved; i++) {
    try {
      await query(
        `INSERT INTO blogs (id, slug, title, category, category_label, published_at, read_time, excerpt,
           cover_image, author_name, author_role, author_avatar, is_featured, content, html_content, faqs,
           seo_title, seo_description, is_active, pending_review, review_notes, source, source_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, '{}', $13, $14,
           $15, $16, $17, $18, $19, 'ai_auto', $20)`,
        [row.id, row.slug, row.title, row.category, row.category_label, row.published_at, row.read_time, row.excerpt,
          row.cover_image, row.author_name, row.author_role, row.author_avatar, row.html_content, toJson(row.faqs),
          row.seo_title, row.seo_description, row.is_active, row.pending_review, row.review_notes, row.source_url]
      );
      saved = true;
    } catch (err) {
      // Slug collided with an existing post — retry once with a suffix.
      if ((err as { code?: string }).code !== "23505" || i > 0) throw err;
      row.slug = `${row.slug}-${Date.now().toString(36).slice(-4)}`;
    }
  }

  const status: AutoBlogStatus = publish ? "published" : "held";
  const reason = publish ? "Passed every check; published." : reviewNotes!;
  await finishRun(runId, status, reason, { pillar, attempts, gate: summarizeGate(gate) }, { blogId: id, model, usage });

  if (publish) {
    try {
      revalidateBlogPaths([row.slug]);
    } catch (err) {
      console.error("[auto-blog] revalidation failed:", err);
    }
    submitToIndexNow([`${SITE_URL}/blog/${row.slug}`, `${SITE_URL}/blog`]).catch((err) =>
      console.error("[auto-blog] IndexNow submission failed:", err)
    );
  }

  return { status, reason, blogId: id, slug: row.slug, title: row.title, pillar };
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The H1 of the page at `href`, for a link label. */
function pageLabel(href: string): string {
  const page = getRenderableGeoPages().find((p) => p.href === href) ?? ALL_CONTENT_HUB_PAGES.find((p) => p.href === href);
  return page?.h1 ?? href;
}

/**
 * For a brief: a link to the landing page it supports (if the model didn't
 * already link it) and the sources its facts came from. Built here, not by
 * the model.
 */
function briefAttribution(brief: EditorialBrief, html: string): string {
  const related = html.includes(`href="${brief.linkTo}"`)
    ? ""
    : `\n<p>Related guide: <a href="${brief.linkTo}">${escapeHtml(pageLabel(brief.linkTo))}</a></p>`;
  const sources = brief.sources.length
    ? `Sources: ${brief.sources.map((src) => `<a href="${escapeHtml(src.url)}" rel="nofollow noopener noreferrer" target="_blank">${escapeHtml(src.label)}</a>`).join("; ")}. `
    : "";
  return sources ? `${related}\n<p><em>${sources.trim()}</em></p>` : related;
}

/** Credits the news article the post is based on (built here, not by the model). */
function sourceAttribution(item: NewsItem, resolvedUrl: string): string {
  const escape = escapeHtml;
  const url = /^https:\/\//.test(resolvedUrl) && !/news\.google\.com/.test(resolvedUrl) ? resolvedUrl : null;
  const label = `${escape(item.source)}: “${escape(item.title)}”`;
  return `\n<p><em>Source: ${url ? `<a href="${escape(url)}" rel="nofollow noopener noreferrer" target="_blank">${label}</a>` : label}.</em></p>`;
}

/** Appends links to related landing pages when the model linked fewer than the minimum. */
function withRelatedLinks(draft: ParsedBlogDraft): string {
  const linked = new Set([...draft.htmlContent.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
  if (linked.size >= MIN_INTERNAL_LINKS) return draft.htmlContent;
  const extra = getRelatedLandingPagesForText(`${draft.title} ${htmlToText(draft.htmlContent)}`, 6)
    .filter((page) => !linked.has(page.href))
    .slice(0, MIN_INTERNAL_LINKS - linked.size);
  if (!extra.length) return draft.htmlContent;
  const links = extra.map((page) => `<a href="${page.href}">${escapeHtml(page.h1)}</a>`).join(" · ");
  return `${draft.htmlContent}\n<p>Related guides: ${links}</p>`;
}

function summarizeGate(gate: GateResult) {
  return { decision: gate.decision, reasons: gate.reasons, warnings: gate.warnings, metrics: gate.metrics };
}

async function finishRun(
  runId: number,
  status: AutoBlogStatus,
  reason: string,
  checks: Record<string, unknown>,
  extra: { blogId?: string; model?: string; usage?: unknown } = {}
) {
  await query(
    `UPDATE blog_automation_runs
        SET status = $2, reason = $3, checks = $4, blog_id = $5, model = $6, usage = $7, finished_at = now()
      WHERE id = $1`,
    [runId, status, reason.slice(0, 4000), toJson(checks), extra.blogId ?? null, extra.model ?? null, toJson(extra.usage ?? null)]
  );
}

/** Whether scheduled runs are paused (migration 015). `pausedUntil` is an ISO time, "infinity", or null. */
export async function getAutoBlogPause(): Promise<{ paused: boolean; pausedUntil: string | null }> {
  const row = await queryOne<{ paused_until: string | null; paused: boolean | null }>(
    "SELECT paused_until, paused_until > now() AS paused FROM blog_automation_settings WHERE id"
  );
  return { paused: Boolean(row?.paused), pausedUntil: row?.paused ? row.paused_until : null };
}

/** Pause scheduled runs until `until` (a timestamptz literal, or "infinity"), or resume with null. */
export async function setAutoBlogPause(until: string | null): Promise<void> {
  await query(
    `INSERT INTO blog_automation_settings (id, paused_until, updated_at) VALUES (true, $1, now())
       ON CONFLICT (id) DO UPDATE SET paused_until = EXCLUDED.paused_until, updated_at = now()`,
    [until]
  );
}

/** Recent runs, newest first — for the admin panel and the cron status call. */
export async function getRecentAutoBlogRuns(limit = 10) {
  return query<{
    id: string; started_at: string; finished_at: string | null; status: AutoBlogStatus; trigger: string;
    pillar: string | null; reason: string | null; blog_id: string | null; source_title: string | null;
  }>(
    `SELECT id, started_at, finished_at, status, trigger, pillar, reason, blog_id, source_title
       FROM blog_automation_runs ORDER BY started_at DESC LIMIT $1`,
    [limit]
  );
}

