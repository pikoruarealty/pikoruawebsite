import "server-only";

import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { crmRateLimit, getClientIdentifier } from "@/lib/rate-limit";

/**
 * Guards the in-house CRM lead feed. Returns an error response to send back,
 * or null when the request carries `Authorization: Bearer <CRM_API_KEY>`.
 */
export function checkCrmRequest(req: Request): NextResponse | null {
  const rl = crmRateLimit(getClientIdentifier(req));
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.CRM_API_KEY;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!apiKey || !safeEqual(token, apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
