import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { checkCrmRequest } from "@/lib/crm-auth";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/**
 * Lead feed for the in-house CRM (same VPS, called over localhost; blocked
 * publicly in Nginx). See docs/VPS_MIGRATION_PLAN.md, Phase 4i.
 *
 *   GET /api/crm/leads?unsynced=true&since=<ISO timestamp>&limit=100
 *
 * Returns leads oldest-first in the DB's snake_case shape, each with its
 * consultation_bookings / property_enquiries rows, plus `next_since` to pass
 * as `since` on the next call. Mark received leads via POST /api/crm/leads/ack.
 */
export async function GET(req: NextRequest) {
  const denied = checkCrmRequest(req);
  if (denied) return denied;

  const params = req.nextUrl.searchParams;
  const conditions: string[] = [];
  const values: unknown[] = [];

  const since = params.get("since");
  if (since) {
    // Cast in SQL: accepts both ISO strings and the `next_since` format Postgres returns.
    values.push(since);
    conditions.push(`l.created_at > $${values.length}::timestamptz`);
  }
  if (params.get("unsynced") === "true") {
    conditions.push("l.crm_synced = false");
  }

  const requested = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : DEFAULT_LIMIT;
  values.push(limit);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const leads = await query<{ created_at: string }>(
      `SELECT l.*,
        COALESCE((SELECT json_agg(cb) FROM consultation_bookings cb WHERE cb.lead_id = l.id), '[]'::json) AS consultation_bookings,
        COALESCE((SELECT json_agg(pe) FROM property_enquiries pe WHERE pe.lead_id = l.id), '[]'::json) AS property_enquiries
      FROM leads l
      ${where}
      ORDER BY l.created_at ASC
      LIMIT $${values.length}`,
      values
    );

    return NextResponse.json({
      leads,
      count: leads.length,
      next_since: leads.length > 0 ? leads[leads.length - 1].created_at : since,
    });
  } catch (err) {
    // 22007/22008: invalid datetime format / out of range in `since`.
    const code = (err as { code?: string } | null)?.code;
    if (code === "22007" || code === "22008") {
      return NextResponse.json({ error: "Invalid `since` timestamp" }, { status: 400 });
    }
    console.error("[crm/leads] Failed to fetch leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
