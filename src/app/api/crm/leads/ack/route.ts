import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkCrmRequest } from "@/lib/crm-auth";
import { markLeadsSynced } from "@/lib/crm-leads";

const ackSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(500),
});

/**
 * Marks leads as received by the in-house CRM.
 *
 *   POST /api/crm/leads/ack   { "ids": ["<lead uuid>", ...] }
 *
 * Sets crm_synced = true and records a 'crm_synced' lead event for each lead
 * that wasn't already synced. Returns the ids that were newly marked; repeated
 * or unknown ids are ignored, so acking twice is safe.
 */
export async function POST(req: NextRequest) {
  const denied = checkCrmRequest(req);
  if (denied) return denied;

  let ids: string[];
  try {
    ids = ackSchema.parse(await req.json()).ids;
  } catch {
    return NextResponse.json({ error: "Body must be { ids: string[] } of lead UUIDs (max 500)" }, { status: 400 });
  }

  try {
    const synced = await markLeadsSynced(ids);
    return NextResponse.json({ ok: true, synced });
  } catch (err) {
    console.error("[crm/leads/ack] Failed to mark leads synced:", err);
    return NextResponse.json({ error: "Failed to mark leads synced" }, { status: 500 });
  }
}
