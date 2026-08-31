/** Parse helpers for salesorderheader heuristics. */

export const extractLastMonths = (q: string, fallback = 3): number => {
  const m =
    q.match(/\blast\s+(\d+)\s+months?\b/) ||
    q.match(/\bover\s+the\s+last\s+(\d+)\s+months?\b/) ||
    q.match(/\bpast\s+(\d+)\s+months?\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 120);
}

export const extractLastDays = (q: string, fallback = 30): number => {
  const m =
    q.match(/\blast\s+(\d+)\s+days?\b/) ||
    q.match(/\bpast\s+(\d+)\s+days?\b/) ||
    q.match(/\bfrom\s+the\s+last\s+(\d+)\s+days?\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 3650);
}

/** Year mentioned as "in 2013" or standalone 19xx/20xx near order/sales context. */
export const extractYear = (q: string): number | null => {
  const m =
    q.match(/\bin\s+(19|20)(\d{2})\b/) ||
    q.match(/\bof\s+(19|20)(\d{2})\b/) ||
    q.match(/\b(19|20)(\d{2})\b/);
  if (!m) return null;
  const year = Number(`${m[1]}${m[2]}`);
  return year >= 1900 && year <= 2100 ? year : null;
}

/** Two years for compare / range phrasing (e.g. 2013 vs 2014, between 2013 and 2014). */
export const extractYears = (q: string): number[] | null => {
  const between = q.match(/\bbetween\s+(19|20)(\d{2})\s+and\s+(19|20)(\d{2})\b/);
  if (between) {
    const a = Number(`${between[1]}${between[2]}`);
    const b = Number(`${between[3]}${between[4]}`);
    if (a >= 1900 && b >= 1900) return [Math.min(a, b), Math.max(a, b)];
  }
  const vs = q.match(/\b(19|20)(\d{2})\s+(?:vs\.?|versus)\s+(19|20)(\d{2})\b/);
  if (vs) {
    const a = Number(`${vs[1]}${vs[2]}`);
    const b = Number(`${vs[3]}${vs[4]}`);
    if (a >= 1900 && b >= 1900) return [a, b];
  }
  const of = q.match(/\bof\s+(19|20)(\d{2})\s+(?:vs\.?|versus|and)\s+(19|20)(\d{2})\b/);
  if (of) {
    const a = Number(`${of[1]}${of[2]}`);
    const b = Number(`${of[3]}${of[4]}`);
    if (a >= 1900 && b >= 1900) return [a, b];
  }
  return null;
}

export const extractCustomerId = (q: string): number | null => {
  const m =
    q.match(/\bcustomer\s+(\d+)\b/) ||
    q.match(/\bcustomer\s+id\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractSalesOrderId = (q: string): number | null => {
  const m =
    q.match(/\bsales\s+order\s+(\d+)\b/) ||
    q.match(/\border\s+#?\s*(\d+)\b/) ||
    q.match(/\bsalesorderid\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractSalesPersonId = (q: string): number | null => {
  const m =
    q.match(/\bsales\s*person\s+(\d+)\b/) ||
    q.match(/\bsalesperson\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const extractStatus = (q: string): number | null => {
  const m = q.match(/\bstatus\s+(\d+)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

export const extractTopN = (q: string, fallback = 10): number => {
  const m =
    q.match(/\btop\s+(\d+)\b/) ||
    q.match(/\blatest\s+(\d+)\b/) ||
    q.match(/\boldest\s+(\d+)\b/) ||
    q.match(/\bcheapest\s+(\d+)\b/) ||
    q.match(/\blowest\s+(\d+)\b/) ||
    q.match(/\bhighest\s+(\d+)\b/) ||
    q.match(/\bsample\s+of\s+(\d+)\b/) ||
    q.match(/\brandom\s+sample\s+of\s+(\d+)\b/) ||
    q.match(/\bfirst\s+(\d+)\b/);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export const extractMinTotalDue = (q: string): number | null => {
  const m =
    q.match(/\btotaldue\s+over\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\bover\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\babove\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\bmin(?:imum)?\s+totaldue\s+\$?(\d+(?:\.\d+)?)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const extractMaxTotalDue = (q: string): number | null => {
  const m =
    q.match(/\bunder\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\bbelow\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\btotaldue\s+(?:under|below|less\s+than)\s+\$?(\d+(?:\.\d+)?)\b/) ||
    q.match(/\bmax(?:imum)?\s+totaldue\s+\$?(\d+(?:\.\d+)?)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Safe sort keys for sales_orders_by_year (never free-form SQL). */
export type SalesOrdersByYearSort =
  | "orderYear"
  | "orderCount"
  | "salesValue";

export const extractSalesOrdersByYearSort = (
  q: string,
): { sort: SalesOrdersByYearSort; sortDir: "asc" | "desc" } | null => {
  // "sorted by count" / "order by orderCount"
  if (
    /\b(sorted\s+by\s+count|sort(?:ed)?\s+by\s+(?:order\s*)?count|order\s+by\s+(?:order\s*)?count|order\s+by\s+ordercount)\b/.test(
      q,
    )
  ) {
    return {
      sort: "orderCount",
      sortDir: /\basc(ending)?\b/.test(q) ? "asc" : "desc",
    };
  }
  if (
    /\b(order\s+by\s+sales\s*value|order\s+by\s+salesvalue|sorted\s+by\s+sales\s*value)\b/.test(
      q,
    )
  ) {
    return {
      sort: "salesValue",
      sortDir: /\basc(ending)?\b/.test(q) ? "asc" : "desc",
    };
  }
  // "ascending by year" / "order by orderYear"
  if (
    /\b(ascending\s+by\s+year|descending\s+by\s+year|order\s+by\s+(?:order\s*)?year|order\s+by\s+orderyear|sorted\s+by\s+year)\b/.test(
      q,
    )
  ) {
    return {
      sort: "orderYear",
      sortDir: /\bdesc(ending)?\b/.test(q) ? "desc" : "asc",
    };
  }

  const m = q.match(
    /\border\s+by\s+(order\s*count|ordercount|order\s*year|orderyear|sales\s*value|salesvalue|year|count)\b/i,
  );
  if (!m) return null;
  const key = m[1].replace(/\s+/g, "").toLowerCase();
  let sort: SalesOrdersByYearSort = "orderYear";
  if (key === "ordercount" || key === "count") sort = "orderCount";
  else if (key === "salesvalue") sort = "salesValue";
  else sort = "orderYear";

  if (sort === "orderYear") {
    return { sort, sortDir: /\bdesc(ending)?\b/.test(q) ? "desc" : "asc" };
  }
  return { sort, sortDir: /\basc(ending)?\b/.test(q) ? "asc" : "desc" };
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
