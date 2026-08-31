/** Parse helpers for review heuristics (productreview). */

export const extractTopN = (q: string, fallback = 10): number => {
  const m =
    q.match(/\btop\s+(\d+)\b/) ||
    q.match(/\bbottom\s+(\d+)\b/) ||
    q.match(/\blatest\s+(\d+)\b/) ||
    q.match(/\boldest\s+(\d+)\b/) ||
    q.match(/\blast\s+(\d+)\s+(?:product\s+)?reviews?\b/) ||
    q.match(/\bsample\s+of\s+(\d+)\b/) ||
    q.match(/\brandom\s+sample\s+of\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export const extractRating = (q: string): number | null => {
  const m =
    q.match(/\b(\d)\s*[- ]?\s*stars?\b/) ||
    q.match(/\b(\d)\s*[- ]?\s*star\s+rating\b/) ||
    q.match(/\brating\s+(?:of\s+|is\s+|=\s*)?(\d)\b/) ||
    q.match(/\brated\s+(\d)\b/) ||
    q.match(/\bhave\s+a\s+(\d)\s*[- ]?\s*star\b/);
  if (!m) return null;
  const n = Number(m[1] ?? m[2]);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.floor(n);
}

export const extractMinRating = (q: string): number | null => {
  const m =
    q.match(/\b(\d)\s+or\s+higher\b/) ||
    q.match(/\bat\s+least\s+(\d)\b/) ||
    q.match(/\brated\s+between\s+(\d)\s+and\s+\d\b/) ||
    q.match(/\brating\s+between\s+(\d)\s+and\s+\d\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? Math.floor(n) : null;
}

export const extractMaxRating = (q: string): number | null => {
  const below = q.match(/\bbelow\s+(\d)\b/);
  if (below) {
    const n = Number(below[1]) - 1;
    return n >= 1 && n <= 5 ? n : null;
  }
  const between = q.match(/\bbetween\s+\d\s+and\s+(\d)\b/);
  if (between) {
    const n = Number(between[1]);
    return Number.isFinite(n) && n >= 1 && n <= 5 ? Math.floor(n) : null;
  }
  const m = q.match(/\brating\s+below\s+(\d)\b/);
  if (!m) return null;
  const n = Number(m[1]) - 1;
  return n >= 1 && n <= 5 ? n : null;
}

export const extractProductId = (q: string): number | null => {
  const m =
    q.match(/\bproduct\s+(\d+)\b/i) ||
    q.match(/\bproduct\s+id\s+(\d+)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractReviewId = (q: string): number | null => {
  const m = q.match(/\breview\s+(\d+)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractReviewerName = (q: string): string | null => {
  const m =
    q.match(/\breviewer\s+([a-z]+)\b/i) ||
    q.match(/\bby\s+reviewer\s+([a-z]+)\b/i) ||
    q.match(/\bdid\s+([a-z]+)\s+write\b/i) ||
    q.match(/\breviews?\s+by\s+([a-z]+)\b/i);
  if (!m) return null;
  const name = m[1];
  if (/^(the|a|an|all|each|most|product)$/i.test(name)) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export const extractCommentContains = (q: string): string | null => {
  const m =
    q.match(/\bmention(?:ing|s)?\s+([a-z]+)\b/i) ||
    q.match(/\bcomments?\s+containing\s+([a-z]+)\b/i) ||
    q.match(/\binclude\s+([a-z]+)\s+in\s+comments?\b/i) ||
    q.match(/\bcomments?\s+([a-z]+)\b/i);
  if (!m) return null;
  const w = m[1].toLowerCase();
  if (["with", "that", "and", "the", "empty", "no"].includes(w)) return null;
  return w;
}

export const extractYear = (q: string): number | null => {
  const m = q.match(/\bin\s+(19|20)(\d{2})\b/);
  if (!m) return null;
  return Number(`${m[1]}${m[2]}`);
}

export const extractLastMonths = (q: string): number | null => {
  const m = q.match(/\blast\s+(\d+)\s+months?\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 120) : null;
}

export const extractCategory = (q: string): string | null => {
  const map: Record<string, string> = {
    bikes: "Bikes",
    clothing: "Clothing",
    components: "Components",
    accessories: "Accessories",
  };
  const m = q.match(/\bcategor(?:y|ies)\s+([a-z]+)/i);
  if (m && map[m[1].toLowerCase()]) return map[m[1].toLowerCase()];
  for (const [alias, canonical] of Object.entries(map)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && /\bcategor/.test(q)) {
      return canonical;
    }
  }
  // "Bikes vs Clothing"
  for (const [alias, canonical] of Object.entries(map)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && /\b(vs|versus|compare)\b/.test(q)) {
      return canonical;
    }
  }
  return null;
}

export const extractCategories = (q: string): string[] => {
  const map: Record<string, string> = {
    bikes: "Bikes",
    clothing: "Clothing",
    components: "Components",
    accessories: "Accessories",
  };
  const found: string[] = [];
  for (const [alias, canonical] of Object.entries(map)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q) && !found.includes(canonical)) {
      found.push(canonical);
    }
  }
  return found;
}

export const extractColor = (q: string): string | null => {
  const map: Record<string, string> = {
    grey: "Grey",
    gray: "Grey",
    black: "Black",
    silver: "Silver",
    red: "Red",
    yellow: "Yellow",
    blue: "Blue",
    white: "white",
  };
  for (const [alias, canonical] of Object.entries(map)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q)) return canonical;
  }
  return null;
}

export const extractMinPrice = (q: string): number | null => {
  const m =
    q.match(/\bover\s*\$?\s*(\d+)/) ||
    q.match(/\bmore\s+than\s*\$?\s*(\d+)/) ||
    q.match(/\blist\s+price\s+over\s*\$?\s*(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const extractMaxPrice = (q: string): number | null => {
  const m =
    q.match(/\bunder\s*\$?\s*(\d+)/) ||
    q.match(/\bbelow\s*\$?\s*(\d+)/) ||
    q.match(/\bless\s+than\s*\$?\s*(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const extractMinReviewCount = (q: string): number | null => {
  const m =
    q.match(/\bat\s+least\s+(\d+)\s+reviews?\b/) ||
    q.match(/\bwith\s+at\s+least\s+(\d+)\s+reviews?\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
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
