/** Parse helpers for salesorderdetail heuristics. */

const CATEGORY_ALIASES: Record<string, string> = {
  bikes: "Bikes",
  clothing: "Clothing",
  components: "Components",
  accessories: "Accessories",
};

const COLOR_ALIASES: Record<string, string> = {
  grey: "Grey",
  gray: "Grey",
  black: "Black",
  silver: "Silver",
  red: "Red",
  yellow: "Yellow",
  blue: "Blue",
  white: "White",
  multi: "Multi",
};

export const extractTopN = (q: string, fallback = 10): number => {
  const m =
    q.match(/\btop\s+(\d+)\b/) ||
    q.match(/\bbottom\s+(\d+)\b/) ||
    q.match(/\bleast\s+(\d+)\b/) ||
    q.match(/\bfewest\s+(\d+)\b/) ||
    q.match(/\blatest\s+(\d+)\b/) ||
    q.match(/\bsample\s+of\s+(\d+)\b/) ||
    q.match(/\brandom\s+sample\s+of\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export const extractLastMonths = (q: string, fallback = 3): number => {
  const m =
    q.match(/\blast\s+(\d+)\s+months?\b/) ||
    q.match(/\bover\s+the\s+last\s+(\d+)\s+months?\b/) ||
    q.match(/\blast\s+(\d+)\s+month\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 120);
}

export const extractSalesOrderId = (q: string): number | null => {
  const m =
    q.match(/\bsales\s+order\s+(\d+)\b/) ||
    q.match(/\border\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractSalesOrderDetailId = (q: string): number | null => {
  const m =
    q.match(/\bsales\s+order\s+detail\s+(\d+)\b/) ||
    q.match(/\border\s+detail\s+(\d+)\b/) ||
    q.match(/\bline\s+(?:item\s+)?(?:id\s+)?(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractProductId = (q: string): number | null => {
  const m =
    q.match(/\bproduct\s+(\d+)\b/) ||
    q.match(/\bproduct\s+id\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractProductIds = (q: string): number[] => {
  const ids: number[] = [];
  const vs = q.match(/\bproduct\s+(\d+)\s+vs\s+(\d+)\b/);
  if (vs) {
    const a = Number(vs[1]);
    const b = Number(vs[2]);
    if (Number.isFinite(a) && a > 0) ids.push(Math.floor(a));
    if (Number.isFinite(b) && b > 0) ids.push(Math.floor(b));
    return ids;
  }
  for (const m of q.matchAll(/\bproduct\s+(\d+)\b/g)) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0 && !ids.includes(Math.floor(n))) {
      ids.push(Math.floor(n));
    }
  }
  return ids;
}

export const extractCategory = (q: string): string | null => {
  const m =
    q.match(/\bcategor(?:y|ies)\s+([a-z]+)/i) ||
    q.match(/\bin\s+categor(?:y|ies)\s+([a-z]+)/i) ||
    q.match(/\bfor\s+categor(?:y|ies)\s+([a-z]+)/i);
  if (m) {
    const key = m[1].toLowerCase();
    if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  }
  for (const [alias, canonical] of Object.entries(CATEGORY_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && /\bcategor/.test(q)) {
      return canonical;
    }
  }
  return null;
}

/** Color from NL; Title case (Black). Matches bare color words on product/line questions. */
export const extractColor = (q: string): string | null => {
  for (const [alias, canonical] of Object.entries(COLOR_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q)) return canonical;
  }
  return null;
}

export const extractMinQty = (q: string): number | null => {
  const m =
    q.match(/\bquantity\s+over\s+(\d+)\b/) ||
    q.match(/\border\s+qty\s+over\s+(\d+)\b/) ||
    q.match(/\bqty\s+over\s+(\d+)\b/) ||
    q.match(/\bmore\s+than\s+(\d+)\s+(?:units?|qty|quantity)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractMaxUnitPrice = (q: string): number | null => {
  const m =
    q.match(/\bunit\s+price\s+under\s+\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bunit\s+price\s+below\s+\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bunit\s+price\s+less\s+than\s+\$?\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const extractMaxListPrice = (q: string): number | null => {
  const m =
    q.match(/\bunder\s+\$?\s*(\d+(?:\.\d+)?)\s+list\s+price\b/) ||
    q.match(/\blist\s+price\s+under\s+\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bunder\s+\$\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const clampInt = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export const asStringFilter = (value: unknown): string | null => {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}
