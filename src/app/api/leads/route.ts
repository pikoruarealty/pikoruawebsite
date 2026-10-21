import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodTypeAny } from "zod";
import {
  discoverySchema,
  propertyEnquirySchema,
  callbackSchema,
  consultationSchema,
  contactSchema,
} from "@/lib/validations/lead";
import { withTransaction, toJson } from "@/lib/db";
import { getClientIdentifier, leadRateLimit } from "@/lib/rate-limit";
import type { LeadSource } from "@/types";

const SCHEMAS: Record<string, ZodTypeAny> = {
  discovery: discoverySchema,
  enquiry: propertyEnquirySchema,
  callback: callbackSchema,
  consultation: consultationSchema,
  contact: contactSchema,
  popup: contactSchema,
};

export async function POST(req: NextRequest) {
  const ip = getClientIdentifier(req);
  const rl = leadRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const source = (raw.source ?? "contact") as LeadSource;

  if (raw.honeypot && String(raw.honeypot).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const schema = SCHEMAS[source];
  if (!schema) {
    return NextResponse.json({ error: "Unknown submission source" }, { status: 400 });
  }

  let data: Record<string, unknown>;
  try {
    data = schema.parse(raw) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", fields: err.flatten().fieldErrors },
        { status: 422 }
      );
    }
    throw err;
  }

  try {
    const leadId = await saveLead(source, data);
    return NextResponse.json({ ok: true, leadId });
  } catch (err) {
    console.error("[leads/route] Failed to save lead:", err);
    return NextResponse.json(
      { error: "We couldn't save your request. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }
}

/**
 * Writes the lead, its source-specific detail row, and the 'created' audit
 * event in one transaction. `is_hot` is computed by the set_is_hot trigger.
 */
async function saveLead(source: string, data: Record<string, unknown>): Promise<string> {
  const locations = Array.isArray(data.locations) ? (data.locations as string[]) : null;
  const message = [text(data.interest) && `Interest: ${text(data.interest)}`, text(data.message)]
    .filter(Boolean)
    .join("\n") || null;

  return withTransaction(async (client) => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO leads (
        source, name, phone, whatsapp, email, category, location, locations,
        budget_band, purpose, timeline, preferred_callback_time, property_ref,
        message, utm, consent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        source,
        text(data.name),
        text(data.phone),
        text(data.whatsapp),
        text(data.email),
        text(data.category),
        locations?.[0] ?? null,
        locations,
        text(data.budgetBand),
        // Consultation uses its own purpose values (buy/sell/...), stored on the booking row.
        source === "consultation" ? null : text(data.purpose),
        text(data.timeline),
        text(data.preferredCallbackTime),
        text(data.propertyRef),
        message,
        toJson(data.utm),
        data.consent === true,
      ]
    );
    const leadId = rows[0].id;

    if (source === "enquiry") {
      await client.query(
        "INSERT INTO property_enquiries (lead_id, property_ref, message) VALUES ($1, $2, $3)",
        [leadId, text(data.propertyRef), text(data.message)]
      );
    } else if (source === "consultation") {
      await client.query(
        `INSERT INTO consultation_bookings (lead_id, preferred_date, preferred_time, purpose, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [leadId, text(data.preferredDate), text(data.preferredTimeSlot), text(data.purpose), text(data.notes)]
      );
    }

    await client.query(
      "INSERT INTO lead_events (lead_id, type, payload) VALUES ($1, 'created', $2)",
      [leadId, toJson({ source })]
    );

    return leadId;
  });
}

/** Trimmed string or null — empty optional fields are stored as NULL. */
function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
