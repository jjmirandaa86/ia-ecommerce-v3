/** Pilot allowlist — AdventureWorks-style ecommerce client DB. */
export const ECOMMERCE_ALLOWED_TABLES = [
  "product",
  "productsubcategory",
  "productcategory",
  "salesorderheader",
  "salesorderdetail",
  "customer",
  "individual",
  "contact",
  "productinventory",
  "productreview",
] as const;

export type AllowedTable = (typeof ECOMMERCE_ALLOWED_TABLES)[number];

const ALLOWED = new Set<string>(ECOMMERCE_ALLOWED_TABLES);

export const assertAllowlistedSql = (sql: string): void => {
  const normalized = sql.replace(/\s+/g, " ").trim();
  if (!/^select\b/i.test(normalized)) {
    throw new Error("Only SELECT is allowed");
  }
  if (/\b(insert|update|delete|drop|alter|truncate|create|grant|revoke)\b/i.test(normalized)) {
    throw new Error("Forbidden SQL keyword");
  }
  const fromMatches = [...normalized.matchAll(/\b(?:from|join)\s+([`"]?)([a-zA-Z0-9_]+)\1/gi)];
  for (const m of fromMatches) {
    const table = m[2]?.toLowerCase();
    if (!table || !ALLOWED.has(table)) {
      throw new Error(`Table not allowlisted: ${table ?? "?"}`);
    }
  }
}
