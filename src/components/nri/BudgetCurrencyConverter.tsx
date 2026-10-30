"use client";

import { useState } from "react";

/** INR per one unit of each currency (from src/lib/exchange-rates.ts). */
export type InrRates = Record<string, number>;

const CURRENCIES = [
  { code: "USD", label: "US dollar" },
  { code: "GBP", label: "British pound" },
  { code: "AED", label: "UAE dirham" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "AUD", label: "Australian dollar" },
  { code: "SGD", label: "Singapore dollar" },
] as const;

const UNITS = [
  { id: "crore", label: "Crore (₹)", inr: 10_000_000 },
  { id: "lakh", label: "Lakh (₹)", inr: 100_000 },
  ...CURRENCIES.map((c) => ({ id: c.code, label: c.code, inr: 0 })),
] as const;

const formatInr = (inr: number) => {
  if (inr >= 10_000_000) return `₹${(inr / 10_000_000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} crore`;
  if (inr >= 100_000) return `₹${(inr / 100_000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} lakh`;
  return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatForeign = (amount: number, code: string) =>
  amount.toLocaleString("en-US", { style: "currency", currency: code, maximumFractionDigits: 0 });

/**
 * Property-budget converter for NRIs: an amount in crore, lakh or a foreign
 * currency, shown in every other unit at the indicative rates passed in.
 */
export function BudgetCurrencyConverter({ rates }: { rates: InrRates }) {
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<string>("crore");

  const value = Number(amount.replace(/,/g, ""));
  const valid = Number.isFinite(value) && value > 0;
  const unitDef = UNITS.find((u) => u.id === unit)!;
  const inr = valid ? value * (unitDef.inr || rates[unit] || 0) : 0;

  return (
    <div className="border border-white/[0.08] bg-soft-black p-5 sm:p-8 rounded-sm">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans mb-2">Amount</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-lux-black border border-white/[0.12] rounded-sm px-4 py-3 text-ivory text-lg font-sans focus:outline-none focus:border-champagne-gold/60"
            aria-label="Amount to convert"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans mb-2">In</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full sm:w-44 bg-lux-black border border-white/[0.12] rounded-sm px-4 py-3 text-ivory text-base font-sans focus:outline-none focus:border-champagne-gold/60"
            aria-label="Unit of the amount"
          >
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06]" aria-live="polite">
        <div className="bg-soft-black p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans">Indian rupees</p>
          <p className="mt-1 font-display text-xl text-ivory">{valid ? formatInr(inr) : "—"}</p>
        </div>
        {CURRENCIES.filter((c) => c.code !== unit).map((c) => (
          <div key={c.code} className="bg-soft-black p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 font-sans">{c.label}</p>
            <p className="mt-1 font-display text-xl text-ivory">{valid && rates[c.code] ? formatForeign(inr / rates[c.code], c.code) : "—"}</p>
          </div>
        ))}
      </div>
      {!valid && <p className="mt-3 text-xs text-ivory/50 font-sans">Enter an amount greater than zero.</p>}
    </div>
  );
}
