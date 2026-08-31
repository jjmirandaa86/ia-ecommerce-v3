/** Parse helpers for customer heuristics. */

export const extractTopN = (q: string, fallback = 10): number => {
  const m =
    q.match(/\btop\s+(\d+)\b/) ||
    q.match(/\bbottom\s+(\d+)\b/) ||
    q.match(/\blatest\s+(\d+)\b/) ||
    q.match(/\boldest\s+(\d+)\b/) ||
    q.match(/\blist\s+(\d+)\b/) ||
    q.match(/\bsample\s+of\s+(\d+)\b/) ||
    q.match(/\brandom\s+sample\s+of\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export const extractCustomerId = (q: string): number | null => {
  const m =
    q.match(/\bcustomer\s+(?:id\s+)?(\d+)\b/i) ||
    q.match(/\bcustomerid\s+(\d+)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractAccountNumber = (q: string): string | null => {
  const m =
    q.match(/\baccount\s+(?:number\s+)?(AW[A-Z0-9]{4,13})\b/i) ||
    q.match(/\baccountnumber\s+(AW[A-Z0-9]{4,13})\b/i);
  if (!m) return null;
  return m[1].toUpperCase();
}

export const extractCustomerType = (q: string): string | null => {
  if (/\b(store|stores)\b/.test(q) && !/\bindividual\b/.test(q) && !/\btype\s+[IS]\b/i.test(q)) {
    return "S";
  }
  if (/\bindividual\b/.test(q) && !/\btype\s+[IS]\b/i.test(q)) return "I";
  const m = q.match(/\btype\s+([IS])\b/i) || q.match(/\bcustomer\s+type\s+([IS])\b/i);
  if (!m) return null;
  return m[1].toUpperCase();
}

export const extractTerritoryId = (q: string): number | null => {
  const m = q.match(/\bterritory\s+(\d+)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractCategory = (q: string): string | null => {
  const map: Record<string, string> = {
    bikes: "Bikes",
    clothing: "Clothing",
    components: "Components",
    accessories: "Accessories",
  };
  for (const [alias, canonical] of Object.entries(map)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(q)) return canonical;
  }
  return null;
}

export const extractLastMonths = (q: string, fallback = 12): number => {
  const optional = extractLastMonthsOptional(q);
  return optional ?? fallback;
}

/** Returns null when the question has no explicit period cue. */
export const extractLastMonthsOptional = (q: string): number | null => {
  const years =
    q.match(/\blast\s+(\d+)\s+years?\b/) ||
    q.match(/\bpast\s+(\d+)\s+years?\b/) ||
    q.match(/\bover\s+the\s+last\s+(\d+)\s+years?\b/);
  if (years) {
    const n = Number(years[1]);
    if (Number.isFinite(n) && n >= 1) return Math.min(Math.floor(n) * 12, 120);
  }
  if (/\blast\s+year\b|\bpast\s+year\b|\bin\s+the\s+last\s+year\b/.test(q)) {
    return 12;
  }
  const m =
    q.match(/\blast\s+(\d+)\s+months?\b/) ||
    q.match(/\bover\s+the\s+last\s+(\d+)\s+months?\b/) ||
    q.match(/\bpast\s+(\d+)\s+months?\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 120);
}

export const extractMinSpend = (q: string): number | null => {
  const m =
    q.match(/\bover\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bmore\s+than\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bspend(?:ing)?\s+over\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bat\s+least\s*\$?\s*(\d[\d,]*)\b/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const extractMaxSpend = (q: string): number | null => {
  const m =
    q.match(/\bunder\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bbelow\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bless\s+than\s*\$?\s*(\d[\d,]*)\b/) ||
    q.match(/\bspend(?:ing)?\s+under\s*\$?\s*(\d[\d,]*)\b/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const extractMinOrders = (q: string): number | null => {
  const m =
    q.match(/\bat\s+least\s+(\d+)\s+orders?\b/) ||
    q.match(/\bwith\s+(\d+)\s+or\s+more\s+orders?\b/) ||
    q.match(/\bmin(?:imum)?\s+(\d+)\s+orders?\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractYear = (q: string): number | null => {
  const m = q.match(/\bin\s+(19|20)(\d{2})\b/) || q.match(/\bafter\s+(19|20)(\d{2})\b/);
  if (!m) return null;
  return Number(`${m[1]}${m[2]}`);
}

const NAME_STOP = new Set([
  "customer",
  "customers",
  "store",
  "individual",
  "type",
  "territory",
  "order",
  "orders",
  "sales",
  "spend",
  "account",
  "the",
  "a",
  "an",
  "is",
  "are",
  "with",
  "have",
  "has",
  "that",
  "who",
  "named",
  "name",
  "first",
  "last",
]);

const cleanNameToken = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const t = raw.trim();
  if (t.length < 2 || t.length > 40) return null;
  if (NAME_STOP.has(t.toLowerCase())) return null;
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(t)) return null;
  // Heuristic input is lowercased; restore Title Case for display/filters.
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** e.g. "first name Michelle", "firstname is Ana" */
export const extractFirstName = (q: string): string | null => {
  const m =
    q.match(/\bfirst\s*names?\s+(?:is\s+|of\s+)?([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bfirstname\s+(?:is\s+)?([A-Za-z][A-Za-z'-]{1,40})\b/i);
  return cleanNameToken(m?.[1]);
};

/** e.g. "last name Adams", "lastname Smith" */
export const extractLastName = (q: string): string | null => {
  const m =
    q.match(/\blast\s*names?\s+(?:is\s+|of\s+)?([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\blastname\s+(?:is\s+)?([A-Za-z][A-Za-z'-]{1,40})\b/i);
  return cleanNameToken(m?.[1]);
};

/**
 * "named John", "named John Smith", "name is Michelle"
 * Prefer explicit first/last extractors when both appear.
 * Does not match "name like …" (use extractNameContains).
 */
export const extractNamedPerson = (
  q: string,
): { firstName?: string; lastName?: string } | null => {
  if (/\bname\s+like\b|\bname\s+contains\b/.test(q)) return null;
  const named =
    q.match(/\bnamed\s+([A-Za-z][A-Za-z'-]{1,40})(?:\s+([A-Za-z][A-Za-z'-]{1,40}))?\b/i) ||
    q.match(/\bname\s+is\s+([A-Za-z][A-Za-z'-]{1,40})(?:\s+([A-Za-z][A-Za-z'-]{1,40}))?\b/i);
  if (!named) return null;
  const firstName = cleanNameToken(named[1]) ?? undefined;
  const lastName = cleanNameToken(named[2]) ?? undefined;
  if (!firstName && !lastName) return null;
  return { firstName, lastName };
};

/** e.g. "name like miranda", "name contains smith", "whose name like ana" */
export const extractNameContains = (q: string): string | null => {
  const m =
    q.match(/\bnames?\s+like\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\bnames?\s+contains?\s+([A-Za-z][A-Za-z'-]{1,40})\b/i) ||
    q.match(/\blike\s+name\s+([A-Za-z][A-Za-z'-]{1,40})\b/i);
  return cleanNameToken(m?.[1]);
};

/** e.g. "email michelle2@adventure-works.com" */
export const extractEmail = (q: string): string | null => {
  const labeled = q.match(
    /\b(?:email|e-mail|email\s+address)\s+(?:is\s+|of\s+)?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i,
  );
  if (labeled) return labeled[1].toLowerCase();
  if (!/\b(email|e-mail|contact)\b/i.test(q)) return null;
  const bare = q.match(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i);
  return bare ? bare[1].toLowerCase() : null;
}

/** e.g. "phone 150-555-0113" */
export const extractPhone = (q: string): string | null => {
  const m =
    q.match(/\b(?:phone|telephone|tel)\s+(?:is\s+|number\s+)?([\d][\d\-\s]{6,20}\d)\b/i) ||
    q.match(/\bphone\s*#?\s*([\d][\d\-]{6,18})\b/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, "").trim();
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
