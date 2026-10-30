import "server-only";

import { query, withTransaction } from "@/lib/db";

/**
 * A lead as sent to the in-house CRM: the `leads` row in snake_case, with its
 * consultation_bookings / property_enquiries rows. The push webhook and the
 * pull feed (/api/crm/leads) both send exactly this shape.
 */
export type CrmLead = {
  id: string;
  created_at: string;
  phone: string;
  whatsapp: string | null;
  [column: string]: unknown;
};

const SELECT_CRM_LEADS = `SELECT l.*,
  COALESCE((SELECT json_agg(cb) FROM consultation_bookings cb WHERE cb.lead_id = l.id), '[]'::json) AS consultation_bookings,
  COALESCE((SELECT json_agg(pe) FROM property_enquiries pe WHERE pe.lead_id = l.id), '[]'::json) AS property_enquiries
FROM leads l`;

/** Loads leads oldest-first. `conditions` use $1..$n placeholders bound to `values`. */
export async function selectCrmLeads(conditions: string[], values: unknown[], limit: number): Promise<CrmLead[]> {
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query<CrmLead>(
    `${SELECT_CRM_LEADS} ${where} ORDER BY l.created_at ASC LIMIT $${values.length + 1}`,
    [...values, limit]
  );
  return rows.map((lead) => ({
    ...lead,
    phone: toE164(lead.phone) ?? lead.phone,
    whatsapp: toE164(lead.whatsapp),
  }));
}

/**
 * Sets crm_synced = true and logs a 'crm_synced' event for leads not already
 * synced. Already-synced or unknown ids are ignored. Returns the newly marked ids.
 */
export async function markLeadsSynced(ids: string[]): Promise<string[]> {
  return withTransaction(async (client) => {
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
}

/**
 * Converts a stored phone number to E.164 (+<country><number>). Forms accept a
 * bare 10-digit Indian mobile or a +country number; older rows may also hold
 * 91XXXXXXXXXX or 0XXXXXXXXXX. Anything unrecognised is returned cleaned but unchanged.
 */
export function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^91[6-9]\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned.slice(1)}`;
  return cleaned;
}
