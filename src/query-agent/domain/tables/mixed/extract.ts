/** Parse helpers for mixed-join heuristics. */

export function clampInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export function extractLastMonthsOptional(q: string): number | null {
  const years =
    q.match(/\blast\s+(\d+)\s+years?\b/) ||
    q.match(/\bin\s+the\s+last\s+(\d+)\s+years?\b/) ||
    q.match(/\bpast\s+(\d+)\s+years?\b/);
  if (years) {
    const n = Number(years[1]);
    if (Number.isFinite(n) && n >= 1) return Math.min(Math.floor(n) * 12, 120);
  }
  if (/\blast\s+year\b|\bpast\s+year\b/.test(q)) return 12;
  const m =
    q.match(/\blast\s+(\d+)\s+months?\b/) ||
    q.match(/\bover\s+the\s+last\s+(\d+)\s+months?\b/) ||
    q.match(/\bpast\s+(\d+)\s+months?\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 120);
}

const STOP = new Set([
  "product",
  "products",
  "customer",
  "customers",
  "name",
  "names",
  "like",
  "sales",
  "sale",
  "order",
  "orders",
  "last",
  "year",
  "years",
  "month",
  "months",
  "that",
  "have",
  "with",
  "and",
  "the",
  "a",
  "an",
  "give",
  "show",
  "list",
]);

function cleanToken(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t.length < 2 || t.length > 40) return null;
  if (STOP.has(t.toLowerCase())) return null;
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(t)) return null;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** "products name Tire", "products like Helmet", "product named Chain" */
export function extractProductNameContains(q: string): string | null {
  const m =
    q.match(/\bproducts?\s+name\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bproducts?\s+(?:named\s+|name\s+)?like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bproducts?\s+named\s+([A-Za-z][A-Za-z'-]{1,40})\b/i);
  return cleanToken(m?.[1]);
}

/** "customer have names like Miranda", "customers named like Adams" */
export function extractCustomerNameContains(q: string): string | null {
  const m =
    q.match(/\bcustomers?\s+have\s+names?\s+like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bcustomers?\s+named\s+like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bcustomers?\s+names?\s+like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bbought\s+by\s+customers?\s+named\s+like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bsold\s+to\s+customer\s+([A-Za-z][A-Za-z'-]{1,40})\b/i);
  return cleanToken(m?.[1]);
}

export function extractTopN(q: string, fallback = 25): number {
  const m = q.match(/\btop\s+(\d+)\b/) || q.match(/\blimit\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}
