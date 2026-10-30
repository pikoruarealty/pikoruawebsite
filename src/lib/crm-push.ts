import "server-only";

import { createHmac } from "crypto";
import { markLeadsSynced, selectCrmLeads } from "@/lib/crm-leads";

// First try straight away, then after 10s and 60s. After that the lead stays
// crm_synced = false and the CRM's scheduled pull of /api/crm/leads picks it up.
const RETRY_DELAYS_MS = [0, 10_000, 60_000];
const TIMEOUT_MS = 5_000;

/**
 * Pushes one new lead to the in-house CRM webhook (CRM_WEBHOOK_URL), signed
 * with CRM_WEBHOOK_SECRET. Marks the lead synced when the CRM replies 2xx.
 * Does nothing when either variable is unset. Never throws.
 *
 * Headers: X-Pikorua-Timestamp (Unix seconds) and
 * X-Pikorua-Signature: sha256=<hex HMAC-SHA256 of "<timestamp>.<raw body>">.
 */
export async function pushLeadToCrm(leadId: string): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    const [lead] = await selectCrmLeads(["l.id = $1"], [leadId], 1);
    if (!lead) return;
    const body = JSON.stringify(lead);

    for (const [attempt, delay] of RETRY_DELAYS_MS.entries()) {
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const timestamp = String(Math.floor(Date.now() / 1000));
        const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Pikorua-Timestamp": timestamp,
            "X-Pikorua-Signature": `sha256=${signature}`,
          },
          body,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (res.ok) {
          await markLeadsSynced([leadId]);
          return;
        }
        console.warn(`[crm-push] Lead ${leadId}: attempt ${attempt + 1} got HTTP ${res.status}`);
      } catch (err) {
        console.warn(`[crm-push] Lead ${leadId}: attempt ${attempt + 1} failed:`, err);
      }
    }
    console.error(`[crm-push] Lead ${leadId}: push failed, leaving it for the CRM pull`);
  } catch (err) {
    console.error(`[crm-push] Lead ${leadId}: could not push:`, err);
  }
}
