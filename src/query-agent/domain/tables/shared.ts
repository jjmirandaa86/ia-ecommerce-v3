/** Shared parse helpers for product (and other) heuristics. */

/** Canonical Color values seen in AdventureWorks product.Color */
const PRODUCT_COLOR_ALIASES: Record<string, string> = {
  grey: "Grey",
  gray: "Grey",
  black: "Black",
  silver: "Silver",
  red: "Red",
  yellow: "Yellow",
  blue: "Blue",
  white: "white",
  multi: "Multi",
};

const CATEGORY_ALIASES: Record<string, string> = {
  bikes: "Bikes",
  bike: "Bikes",
  clothing: "Clothing",
  components: "Components",
  component: "Components",
  accessories: "Accessories",
  accessory: "Accessories",
};

export const extractTopN = (q: string, fallback = 10): number => {
  const m =
    q.match(/\btop\s+(\d+)\b/) ||
    q.match(/\b(\d+)\s+most\b/) ||
    q.match(/\bsample\s+of\s+(\d+)\b/) ||
    q.match(/\brandom\s+sample\s+of\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export const extractMaxPrice = (q: string, fallback = 50): number => {
  const m =
    q.match(/\bbetween\s+\$?\s*\d+(?:\.\d+)?\s+and\s+\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bunder\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bbelow\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bless\s+than\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bless\s+\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bcost\s+less\s+than\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bmenos\s+de\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 1_000_000);
}

export const extractMinPrice = (q: string, fallback = 0): number | null => {
  const between = q.match(
    /\bbetween\s+\$?\s*(\d+(?:\.\d+)?)\s+and\s+\$?\s*(\d+(?:\.\d+)?)/,
  );
  if (between) {
    const n = Number(between[1]);
    if (Number.isFinite(n) && n >= 0) return Math.min(n, 1_000_000);
  }
  const m =
    q.match(/\bover\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\babove\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bmore\s+than\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bcost\s+more\s+than\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bpriced\s+over\s*\$?\s*(\d+(?:\.\d+)?)/) ||
    q.match(/\bgreater\s+than\s*\$?\s*(\d+(?:\.\d+)?)/);
  if (!m) return fallback > 0 ? fallback : null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, 1_000_000);
}

/** True when the question states an upper price bound (under / less / below…). */
export const hasMaxPriceCue = (q: string): boolean => {
  return (
    (/\b(under|below|less|menos)\b/.test(q) ||
      /\bbetween\s+\$?\s*\d+/.test(q)) &&
    /\b(price|prices|precio|cost|\$?\d+)/.test(q)
  );
}

export const hasMinPriceCue = (q: string): boolean => {
  return (
    /\b(over|above|more\s+than|priced\s+over|greater\s+than)\b/.test(q) ||
    /\bbetween\s+\$?\s*\d+/.test(q)
  );
}

/** Resolve a product Color from NL; null if none / unknown. */
export const extractColor = (q: string): string | null => {
  const nearColor =
    q.match(/\bcolou?rs?\s+(?:is|are|=)?\s*([a-z][a-z/-]*)/i) ||
    q.match(/\bwith\s+colou?r\s+([a-z][a-z/-]*)/i) ||
    q.match(/\b([a-z][a-z/-]*)\s+colou?rs?\b/i);
  if (nearColor) {
    const key = nearColor[1].toLowerCase();
    if (PRODUCT_COLOR_ALIASES[key]) return PRODUCT_COLOR_ALIASES[key];
  }
  for (const [alias, canonical] of Object.entries(PRODUCT_COLOR_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q)) {
      if (/\bcolou?rs?\b/.test(q) || /\bproducts?\b/.test(q)) return canonical;
    }
  }
  return null;
}

export const extractColors = (q: string): string[] => {
  const found: string[] = [];
  for (const [alias, canonical] of Object.entries(PRODUCT_COLOR_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && !found.includes(canonical)) {
      found.push(canonical);
    }
  }
  return found.sort();
}

export const normalizeColor = (value: unknown): string | null => {
  if (value == null) return null;
  const key = String(value).trim().toLowerCase();
  if (!key) return null;
  return PRODUCT_COLOR_ALIASES[key] ?? null;
}

export const extractCategory = (q: string): string | null => {
  const m =
    q.match(/\bcategor(?:y|ies)\s+([a-z]+)/i) ||
    q.match(/\bin\s+categor(?:y|ies)\s+([a-z]+)/i) ||
    q.match(/\b(?:for|of)\s+categor(?:y|ies)\s+([a-z]+)/i);
  if (m) {
    const key = m[1].toLowerCase();
    if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  }
  // "expensive bikes" / "in category Clothing" already covered; also bare category nouns
  for (const [alias, canonical] of Object.entries(CATEGORY_ALIASES)) {
    if (
      new RegExp(`\\b${alias}\\b`, "i").test(q) &&
      (/\bcategor/.test(q) ||
        /\bexpensive\b/.test(q) ||
        /\bproducts?\b/.test(q) ||
        /\baverage\b/.test(q) ||
        /\bcompare\b/.test(q))
    ) {
      return canonical;
    }
  }
  return null;
}

export const extractCategories = (q: string): string[] => {
  const found: string[] = [];
  for (const [alias, canonical] of Object.entries(CATEGORY_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && !found.includes(canonical)) {
      found.push(canonical);
    }
  }
  return found;
}

export const extractSubcategory = (q: string): string | null => {
  const m =
    q.match(/\bsubcategor(?:y|ies)\s+([a-z]+)/i) ||
    q.match(/\bin\s+subcategor(?:y|ies)\s+([a-z]+)/i);
  if (!m) return null;
  const raw = m[1];
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export const extractSize = (q: string): string | null => {
  const m =
    q.match(/\bsize\s+([a-z0-9]+)\b/i) ||
    q.match(/\bproducts?\s+size\s+([a-z0-9]+)\b/i);
  return m ? m[1].toUpperCase() : null;
}

export const extractProductId = (q: string): number | null => {
  const m =
    q.match(/\bproduct\s+(\d+)\b/i) ||
    q.match(/\bproduct\s+id\s+(\d+)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractNameContains = (q: string): string | null => {
  const m =
    q.match(/\bnamed\s+like\s+([a-z0-9-]+)/i) ||
    q.match(/\bcontaining\s+([a-z0-9-]+)/i) ||
    q.match(/\bproducts?\s+containing\s+([a-z0-9-]+)/i) ||
    q.match(/\bsearch\s+products?\s+containing\s+([a-z0-9-]+)/i);
  return m ? m[1].toLowerCase() : null;
}

export const extractProductNumberPrefix = (q: string): string | null => {
  const m = q.match(
    /\bproduct\s+number\s+starting\s+with\s+([a-z0-9]+)/i,
  );
  return m ? m[1].toUpperCase() : null;
}

export const extractProductLine = (q: string): string | null => {
  const m = q.match(/\bproduct\s+line\s+([a-z0-9])\b/i);
  return m ? m[1].toUpperCase() : null;
}

export const extractYear = (q: string): number | null => {
  const m = q.match(/\bin\s+(19|20)(\d{2})\b/);
  if (!m) return null;
  return Number(`${m[1]}${m[2]}`);
}

export const extractMaxWeight = (q: string): number | null => {
  const m = q.match(/\bunder\s+(\d+(?:\.\d+)?)\s*kg\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const clampInt = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export const clampPrice = (value: unknown, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.max(n, 0.01), 1_000_000);
}

export const asStringFilter = (value: unknown): string | null => {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}
