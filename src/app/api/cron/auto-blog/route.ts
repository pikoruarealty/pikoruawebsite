/**
 * Scheduled trigger for the automated blog pipeline (src/lib/ai/blogPipeline.ts).
 *
 * Called by the VPS host crontab over loopback (see docs/VPS_MIGRATION_PLAN.md
 * "Automated blog"), never from the internet: Nginx returns 404 for /api/cron/.
 * Requires `Authorization: Bearer <CRON_SECRET>`.
 *
 *   POST /api/cron/auto-blog           run once (no-op if a post was made in the last 20h)
 *   POST /api/cron/auto-blog?force=1   run even inside that window
 *   POST /api/cron/auto-blog?dryRun=1  draft + quality-gate one post without saving a blog
 *                                      post; records a dry-run row in blog_automation_runs
 *   GET  /api/cron/auto-blog           pause state and recent runs, for monitoring
 *
 * While an admin has paused posting (/admin → Blogs), POST runs are skipped
 * and logged; dry runs still work.
 */

import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getAutoBlogPause, getRecentAutoBlogRuns, isAutoPublishEnabled, runAutoBlog } from "@/lib/ai/blogPipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!secret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = new URL(req.url).searchParams;
  const force = params.get("force") === "1";
  const dryRun = params.get("dryRun") === "1";
  try {
    const result = await runAutoBlog({ trigger: force ? "cron-force" : "cron", force, dryRun });
    return NextResponse.json(result, { status: result.status === "failed" ? 500 : 200 });
  } catch (err) {
    console.error("[cron/auto-blog] run failed:", err);
    return NextResponse.json({ status: "failed", reason: "Pipeline error (see server logs)." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [pause, runs] = await Promise.all([getAutoBlogPause(), getRecentAutoBlogRuns(15)]);
    return NextResponse.json({ autopublish: isAutoPublishEnabled(), ...pause, runs });
  } catch (err) {
    console.error("[cron/auto-blog] status failed:", err);
    return NextResponse.json({ error: "Could not read runs (are migrations 014 and 015 applied?)" }, { status: 500 });
  }
}
