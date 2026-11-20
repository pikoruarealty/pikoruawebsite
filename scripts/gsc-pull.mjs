// Pulls Google Search Console performance data (read-only) into CSV files.
//
//   node scripts/gsc-pull.mjs                # last ~16 months -> data/gsc/<today>/
//   node scripts/gsc-pull.mjs --days 90      # shorter window
//
// Auth: service account key at GSC_KEY_FILE (default ~/.config/pikorua/gsc-key.json).
// The key is never printed or written anywhere. Output lives in data/gsc/ (gitignored).
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SITE = process.env.GSC_SITE || 'sc-domain:pikorua.in';
const KEY_FILE = process.env.GSC_KEY_FILE || join(homedir(), '.config/pikorua/gsc-key.json');
const daysArg = process.argv.indexOf('--days');
const DAYS = daysArg > -1 ? Number(process.argv[daysArg + 1]) : 480; // ~16 months
const PAGE_SIZE = 25000;

const day = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 2 * 86400000); // GSC data lags ~2 days
const start = new Date(end.getTime() - DAYS * 86400000);

async function accessToken() {
  const key = JSON.parse(readFileSync(KEY_FILE, 'utf8'));
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${json.error} ${json.error_description ?? ''}`);
  return json.access_token;
}

async function query(token, dimensions, extra = {}) {
  const rows = [];
  for (let startRow = 0; ; startRow += PAGE_SIZE) {
    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          startDate: day(start),
          endDate: day(end),
          dimensions,
          rowLimit: PAGE_SIZE,
          startRow,
          dataState: 'final',
          ...extra,
        }),
      },
    );
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    const batch = (await res.json()).rows ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(dimensions, rows) {
  const head = [...dimensions, 'clicks', 'impressions', 'ctr', 'position'];
  const lines = rows.map((r) =>
    [...r.keys, r.clicks, r.impressions, r.ctr.toFixed(5), r.position.toFixed(2)].map(csvCell).join(','),
  );
  return [head.join(','), ...lines].join('\n') + '\n';
}

// Each report is its own query so row-limits and aggregation match the Search Console UI.
const reports = {
  date: ['date'],
  query: ['query'],
  page: ['page'],
  country: ['country'],
  device: ['device'],
  'query-page': ['query', 'page'],
  'date-page': ['date', 'page'],
  'date-query': ['date', 'query'],
};

const token = await accessToken();
const outDir = join('data', 'gsc', day(new Date()));
mkdirSync(outDir, { recursive: true });
console.log(`Property ${SITE}, ${day(start)} -> ${day(end)}`);

for (const [name, dims] of Object.entries(reports)) {
  const rows = await query(token, dims);
  writeFileSync(join(outDir, `${name}.csv`), toCsv(dims, rows));
  console.log(`${name.padEnd(12)} ${String(rows.length).padStart(7)} rows`);
}

// Sitemaps + indexing hints come from separate endpoints.
const sm = await fetch(
  `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`,
  { headers: { authorization: `Bearer ${token}` } },
);
writeFileSync(join(outDir, 'sitemaps.json'), JSON.stringify(await sm.json(), null, 2));
console.log(`Saved to ${outDir}/`);
