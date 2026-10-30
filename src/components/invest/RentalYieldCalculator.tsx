"use client";

import { useState } from "react";

const FIELDS = [
  { id: "price", label: "Purchase price (₹)", hint: "Agreed price of the property" },
  { id: "buyingCosts", label: "Buying costs (₹)", hint: "Stamp duty, registration, legal and brokerage" },
  { id: "rent", label: "Monthly rent (₹)", hint: "Rent you expect from a tenant" },
  { id: "maintenance", label: "Monthly maintenance (₹)", hint: "Society maintenance paid by the owner" },
  { id: "propertyTax", label: "Annual property tax (₹)", hint: "Municipal property tax" },
  { id: "otherCosts", label: "Other annual costs (₹)", hint: "Repairs, insurance, management fees" },
  { id: "vacancy", label: "Vacant months per year", hint: "Months without a tenant" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

// Hypothetical starting values so the calculator shows a result; they are not market data.
const EXAMPLE: Record<FieldId, string> = {
  price: "20000000",
  buyingCosts: "1200000",
  rent: "50000",
  maintenance: "6000",
  propertyTax: "20000",
  otherCosts: "30000",
  vacancy: "1",
};

const num = (s: string) => {
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (n: number) => `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;

/** Gross and net rental yield from the user's own figures. */
export function RentalYieldCalculator() {
  const [values, setValues] = useState<Record<FieldId, string>>(EXAMPLE);
  const v = Object.fromEntries(FIELDS.map((f) => [f.id, num(values[f.id])])) as Record<FieldId, number>;
  const valid = FIELDS.every((f) => !Number.isNaN(v[f.id])) && v.price > 0 && v.vacancy <= 12;

  const annualRent = valid ? v.rent * 12 : 0;
  const collectedRent = valid ? v.rent * (12 - v.vacancy) : 0;
  const annualCosts = valid ? v.maintenance * 12 + v.propertyTax + v.otherCosts : 0;
  const netIncome = collectedRent - annualCosts;
  const gross = valid ? (annualRent / v.price) * 100 : 0;
  const net = valid ? (netIncome / (v.price + v.buyingCosts)) * 100 : 0;

  return (
    <div className="border border-white/[0.08] bg-soft-black p-5 sm:p-8 rounded-sm">
      <p className="text-xs text-ivory/45 font-sans mb-5">The figures below are a hypothetical example. Replace them with the numbers for the property you are considering.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <label key={f.id} className="block">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans mb-1.5">{f.label}</span>
            <input
              inputMode="decimal"
              value={values[f.id]}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
              className="w-full bg-lux-black border border-white/[0.12] rounded-sm px-3 py-2.5 text-ivory text-base font-sans focus:outline-none focus:border-champagne-gold/60"
              aria-describedby={`${f.id}-hint`}
            />
            <span id={`${f.id}-hint`} className="block mt-1 text-[11px] text-ivory/35 font-sans">{f.hint}</span>
          </label>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06]" aria-live="polite">
        <div className="bg-soft-black p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans">Gross yield</p>
          <p className="mt-1 font-display text-2xl text-ivory">{valid ? pct(gross) : "—"}</p>
          <p className="mt-1 text-[11px] text-ivory/35 font-sans">Annual rent ÷ price</p>
        </div>
        <div className="bg-soft-black p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans">Net yield</p>
          <p className="mt-1 font-display text-2xl text-ivory">{valid ? pct(net) : "—"}</p>
          <p className="mt-1 text-[11px] text-ivory/35 font-sans">After vacancy and costs, on price + buying costs</p>
        </div>
        <div className="bg-soft-black p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans">Net income per year</p>
          <p className="mt-1 font-display text-2xl text-ivory">{valid ? inr(netIncome) : "—"}</p>
          <p className="mt-1 text-[11px] text-ivory/35 font-sans">Before income tax and loan payments</p>
        </div>
      </div>
      {!valid && <p className="mt-3 text-xs text-ivory/50 font-sans">Enter numbers only; the price must be above zero and vacancy 12 months or less.</p>}
    </div>
  );
}
