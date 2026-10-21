import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withTransaction } from "@/lib/db";
import { checkCrmRequest } from "@/lib/crm-auth";

const ackSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(500),
});

/**
 * Marks leads as received by the in-house CRM.
 *
 *   POST /api/crm/leads/ack   { "ids": ["<lead uuid>", ...] }
 *
 * Sets crm_synced = true and records a 'crm_synced' lead event for each lead
 * that wasn't already synced. Returns the ids that were newly marked.
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
    const synced = await withTransaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        "UPDATE leads SET crm_synced = true WHERE id = ANY($1::uuid[]) AND crm_synced = false RETURNING id",
        [ids]
      );
      const syncedIds = rows.map((r) => r.id);
      if (syncedIds.length > 0) {
        await client.query(
          "INSERT INTO lead_events (lead_id, type) SELECT unnest($1::uuid[]), 'crm_synced'",
          [syncedIds]
        );
      }
      return syncedIds;
    });

    return NextResponse.json({ ok: true, synced });
  } catch (err) {
    console.error("[crm/leads/ack] Failed to mark leads synced:", err);
    return NextResponse.json({ error: "Failed to mark leads synced" }, { status: 500 });
  }
}
