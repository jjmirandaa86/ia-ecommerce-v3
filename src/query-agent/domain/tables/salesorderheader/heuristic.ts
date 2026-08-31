/**
 * heuristic.ts — salesorderheader phrase detection (order-level only).
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractCustomerId,
  extractLastDays,
  extractLastMonths,
  extractMaxTotalDue,
  extractMinTotalDue,
  extractSalesOrderId,
  extractSalesOrdersByYearSort,
  extractSalesPersonId,
  extractStatus,
  extractTopN,
  extractYear,
  extractYears,
} from "@/query-agent/domain/tables/salesorderheader/extract";

export const classifySalesOrderHeaderHeuristic = (q: string): QueryPlan | null => {
  const aboutOrders =
    /\b(sales?\s+orders?|orders?)\b/.test(q) ||
    /\b(sales?|ventas?)\b/.test(q);
  const aboutProducts = /\b(products?|productos?)\b/.test(q);
  const aboutLineItems =
    /\b(selling|sold|line\s+items?|order\s+lines?|order\s+details?)\b/.test(q);

  // Product sales rankings belong to salesorderdetail — never steal them.
  if (aboutProducts && aboutLineItems) return null;
  if (/\btop\s+selling\b|\bleast\s+sold\b|\bmost\s+sold\b|\bbest\s+selling\b/.test(q)) {
    return null;
  }

  const asksCount =
    /\b(how many|count|number of|total number)\b/.test(q) ||
    /\b(cu[aá]ntos?|cantidad)\b/.test(q);
  const asksList =
    /\b(list|show|display)\b/.test(q) ||
    /\borders?\s+for\b/.test(q) ||
    /\borders?\s+from\b/.test(q) ||
    /\borders?\s+with\b/.test(q) ||
    /\borders?\s+between\b/.test(q);

  // —— Due / ship date of last sale (before plain last_sale) ——
  if (
    /\bdue\s+date\b/.test(q) &&
    (/\blast\s+sale\b/.test(q) || /\bmost\s+recent\b/.test(q))
  ) {
    return { intent: "last_sale_due_date", filters: {} };
  }
  if (
    /\bship\s+date\b/.test(q) &&
    (/\blast\s+sale\b/.test(q) ||
      /\bmost\s+recent\b/.test(q) ||
      /\blatest\b/.test(q))
  ) {
    return { intent: "last_sale_ship_date", filters: {} };
  }

  // —— Sample ——
  if (
    (/\brandom\s+sample\b/.test(q) || /\bsample\s+of\b/.test(q)) &&
    aboutOrders
  ) {
    return { intent: "sample_orders", filters: { limit: extractTopN(q, 10) } };
  }

  // —— Latest / oldest N lists (before singular last/first sale) ——
  if (/\blatest\s+\d+\b/.test(q) && aboutOrders) {
    return { intent: "latest_orders", filters: { limit: extractTopN(q, 20) } };
  }
  if (/\boldest\s+\d+\b/.test(q) && aboutOrders) {
    return { intent: "oldest_orders", filters: { limit: extractTopN(q, 10) } };
  }

  // —— First / last sale ——
  if (
    /\bfirst\s+sale\b/.test(q) ||
    /\bearliest\s+(sales?\s+)?order\b/.test(q) ||
    (/\boldest\s+sales?\s+order\b/.test(q) && !/\boldest\s+\d+\b/.test(q))
  ) {
    return { intent: "first_sale", filters: {} };
  }

  if (
    /\blast\s+sale\b/.test(q) ||
    /\bmost\s+recent\s+(sale|order)\b/.test(q) ||
    (/\blatest\s+sales?\s+order\b/.test(q) && !/\blatest\s+\d+\b/.test(q))
  ) {
    return { intent: "last_sale", filters: {} };
  }

  // —— Compare years ——
  if (
    /\bcompare\b/.test(q) &&
    (/\bsales?\s+value\b/.test(q) || /\bsales?\b/.test(q)) &&
    (/\bvs\.?\b/.test(q) || /\bversus\b/.test(q))
  ) {
    const years = extractYears(q);
    if (years && years.length >= 2) {
      return { intent: "compare_sales_years", filters: { years } };
    }
  }

  // —— Top year aggregates ——
  if (
    /\bwhich\s+year\b/.test(q) &&
    (/\bmost\s+sales?\s+orders?\b/.test(q) ||
      /\bhighest\s+order\s+count\b/.test(q) ||
      (/\bmost\b/.test(q) && aboutOrders))
  ) {
    return { intent: "top_year_by_order_count", filters: {} };
  }
  if (
    /\bwhich\s+year\b/.test(q) &&
    (/\bhighest\s+sales?\s+value\b/.test(q) ||
      /\bmost\s+sales?\s+value\b/.test(q) ||
      (/\bhighest\b/.test(q) && /\bsales?\b/.test(q)))
  ) {
    return { intent: "top_year_by_sales_value", filters: {} };
  }

  // —— Pct / variance / median ——
  if (
    (/\bpercent\b/.test(q) || /\bpct\b/.test(q) || /\bpercentage\b/.test(q)) &&
    /\bonline\b/.test(q) &&
    aboutOrders
  ) {
    return { intent: "pct_online_orders", filters: {} };
  }
  if (/\bvariance\b/.test(q) && (/\btotaldue\b/.test(q) || /\border\b/.test(q))) {
    return { intent: "variance_order_value", filters: {} };
  }
  if (/\bmedian\b/.test(q) && (/\border\s+value\b/.test(q) || /\btotaldue\b/.test(q))) {
    return { intent: "median_order_value", filters: {} };
  }

  // —— Average freight / tax ——
  if (/\baverage\s+freight\b/.test(q) || /\bavg\s+freight\b/.test(q)) {
    return { intent: "average_freight", filters: {} };
  }
  if (/\baverage\s+tax\b/.test(q) || /\bavg\s+tax\b/.test(q)) {
    return { intent: "average_tax", filters: {} };
  }

  // —— Online / offline AOV (before generic average) ——
  if (
    (/\baverage\s+order\s+value\b/.test(q) || /\bavg\s+order\s+value\b/.test(q)) &&
    /\bonline\b/.test(q)
  ) {
    return { intent: "average_order_value_online", filters: {} };
  }
  if (
    (/\baverage\s+order\s+value\b/.test(q) || /\bavg\s+order\s+value\b/.test(q)) &&
    /\boffline\b/.test(q)
  ) {
    return { intent: "average_order_value_offline", filters: {} };
  }

  // —— AOV over period / by year / by territory ——
  if (
    (/\baverage\s+order\s+value\b/.test(q) || /\bavg\s+order\s+value\b/.test(q)) &&
    (/\blast\s+\d+\s+months?\b/.test(q) ||
      /\bover\s+the\s+last\b/.test(q) ||
      /\bpast\s+\d+\s+months?\b/.test(q))
  ) {
    return {
      intent: "average_order_value_over_period",
      filters: { lastMonths: extractLastMonths(q, 3) },
    };
  }
  if (
    (/\baverage\s+order\s+value\b/.test(q) || /\bavg\s+order\s+value\b/.test(q)) &&
    /\bby\s+year\b/.test(q)
  ) {
    return { intent: "avg_order_value_by_year", filters: {} };
  }
  if (
    (/\baverage\s+order\s+value\b/.test(q) || /\bavg\s+order\s+value\b/.test(q)) &&
    /\bby\s+territory\b/.test(q)
  ) {
    return { intent: "avg_order_value_by_territory", filters: {} };
  }

  // —— Generic AOV / min / max ——
  if (
    /\baverage\s+order\s+(value|total|amount)\b/.test(q) ||
    /\bavg\s+order\s+value\b/.test(q) ||
    /\bmean\s+order\s+(value|totaldue|total\s*due)\b/.test(q)
  ) {
    return { intent: "average_order_value", filters: {} };
  }
  if (/\bminimum\s+order\s+(value|total|amount)\b/.test(q) || /\bmin\s+order\s+value\b/.test(q)) {
    return { intent: "min_order_value", filters: {} };
  }
  if (/\bmaximum\s+order\s+(value|total|amount)\b/.test(q) || /\bmax\s+order\s+value\b/.test(q)) {
    return { intent: "max_order_value", filters: {} };
  }

  // —— Totals (subtotal / tax / freight / TotalDue) ——
  if (/\bsubtotal\b/.test(q) && (/\btotal\b/.test(q) || /\bsum\b/.test(q))) {
    return { intent: "total_subtotal", filters: {} };
  }
  if (
    (/\bsum\s+of\s+tax\b/.test(q) || (/\btax\s+amounts?\b/.test(q) && /\bsum\b/.test(q))) &&
    aboutOrders
  ) {
    return { intent: "total_tax", filters: {} };
  }
  if (
    (/\bsum\s+of\s+freight\b/.test(q) || (/\bfreight\b/.test(q) && /\bsum\b/.test(q))) &&
    aboutOrders
  ) {
    return { intent: "total_freight", filters: {} };
  }
  if (
    (/\btotal\s+sales?\s+value\b/.test(q) ||
      /\bsum\s+of\s+totaldue\b/.test(q) ||
      /\bsum\s+of\s+all\s+order\s+values?\b/.test(q) ||
      (/\btotaldue\b/.test(q) && /\bsum\b/.test(q) && /\ball\b/.test(q))) &&
    !/\bby\s+year\b/.test(q) &&
    !/\blast\b/.test(q) &&
    !/\bpast\b/.test(q)
  ) {
    return { intent: "total_sales_value", filters: {} };
  }

  // —— Sales value by dimension / in year / over period ——
  if (
    (/\bsales?\s+value\b/.test(q) || /\btotaldue\b/.test(q) || /\brevenue\b/.test(q)) &&
    /\bby\s+status\b/.test(q)
  ) {
    return { intent: "sales_value_by_status", filters: {} };
  }
  if (
    (/\bsales?\s+value\b/.test(q) || /\btotaldue\b/.test(q)) &&
    /\bby\s+month\b/.test(q)
  ) {
    return { intent: "sales_value_by_month", filters: {} };
  }
  if (
    (/\bsales?\s+value\b/.test(q) || /\btotaldue\b/.test(q)) &&
    /\bby\s+year\b/.test(q) &&
    !/\borders?\s+by\s+year\b/.test(q)
  ) {
    return { intent: "sales_value_by_year", filters: {} };
  }
  if (
    (/\bsales?\s+value\b/.test(q) || /\brevenue\b/.test(q)) &&
    extractYear(q) != null &&
    !/\blast\b/.test(q) &&
    !/\bpast\b/.test(q) &&
    !/\bby\s+year\b/.test(q) &&
    !/\bcompare\b/.test(q)
  ) {
    return {
      intent: "sales_value_in_year",
      filters: { year: extractYear(q) },
    };
  }
  if (
    (/\bsales?\s+value\b/.test(q) || /\brevenue\b/.test(q) || /\btotal\s+sales\b/.test(q)) &&
    (/\blast\s+\d+\s+months?\b/.test(q) ||
      /\bover\s+the\s+last\b/.test(q) ||
      /\bpast\s+\d+\s+months?\b/.test(q) ||
      /\bperiod\b/.test(q))
  ) {
    return {
      intent: "sales_value_over_period",
      filters: { lastMonths: extractLastMonths(q, 3) },
    };
  }

  // —— Orders by year / month / status / territory ——
  if (
    /\borders?\s+count\s+grouped\s+by\s+year\b/.test(q) ||
    /\border\s+count\s+grouped\s+by\s+year\b/.test(q) ||
    /\bsales?\s+orders?\s+by\s+year\b/.test(q) ||
    (asksCount && aboutOrders && /\bby\s+year\b/.test(q) && !extractYear(q))
  ) {
    const filters: Record<string, unknown> = {};
    const sort = extractSalesOrdersByYearSort(q);
    if (sort) {
      filters.sort = sort.sort;
      filters.sortDir = sort.sortDir;
    }
    return { intent: "sales_orders_by_year", filters };
  }
  if (
    /\bsales?\s+orders?\s+by\s+month\b/.test(q) ||
    /\border\s+count\s+by\s+month\b/.test(q) ||
    (asksCount && aboutOrders && /\bby\s+month\b/.test(q))
  ) {
    return { intent: "sales_orders_by_month", filters: {} };
  }
  if (
    /\bsales?\s+orders?\s+by\s+status\b/.test(q) ||
    (asksCount && aboutOrders && /\bper\s+status\b/.test(q)) ||
    (/\borders?\s+per\s+status\b/.test(q))
  ) {
    return { intent: "sales_orders_by_status", filters: {} };
  }
  if (/\bsales?\s+orders?\s+by\s+territory\b/.test(q) || (asksCount && aboutOrders && /\bby\s+territory\b/.test(q))) {
    return { intent: "sales_orders_by_territory", filters: {} };
  }

  // —— Online / offline counts (offline / not-online before plain online) ——
  if (
    asksCount &&
    aboutOrders &&
    (/\boffline\b/.test(q) || /\bnot\s+online\b/.test(q))
  ) {
    return { intent: "count_offline_orders", filters: {} };
  }
  if (asksCount && /\bonline\b/.test(q) && aboutOrders && !/\bpercent\b/.test(q)) {
    return { intent: "count_online_orders", filters: {} };
  }

  // —— PO / comment counts & lists ——
  if (
    asksCount &&
    (/\bpurchase\s+order\s+number\b/.test(q) || /\bwith\s+a\s+purchase\s+order\b/.test(q))
  ) {
    return { intent: "count_orders_with_po", filters: {} };
  }
  if (asksCount && /\bno\s+comment\b/.test(q) && aboutOrders) {
    return { intent: "count_orders_without_comment", filters: {} };
  }
  if (
    (/\borders?\s+with\s+comments?\b/.test(q) ||
      (asksList && /\bcomments?\b/.test(q) && aboutOrders)) &&
    !asksCount &&
    !/\bno\s+comment\b/.test(q)
  ) {
    return { intent: "list_orders_with_comments", filters: { limit: extractTopN(q, 25) } };
  }

  // —— Distinct customers ——
  if (
    (asksCount || /\bcount\b/.test(q)) &&
    /\bdistinct\s+customers?\b/.test(q) &&
    aboutOrders
  ) {
    return { intent: "count_distinct_customers_with_orders", filters: {} };
  }

  // —— Shipped period ——
  if (
    /\bshipped\b/.test(q) &&
    aboutOrders &&
    (/\blast\s+\d+\s+months?\b/.test(q) || /\bperiod\b/.test(q))
  ) {
    return {
      intent: "count_orders_shipped_period",
      filters: { lastMonths: extractLastMonths(q, 3) },
    };
  }

  // —— Last N days ——
  if (/\blast\s+\d+\s+days?\b/.test(q) && aboutOrders) {
    const lastDays = extractLastDays(q, 30);
    if (asksCount) {
      return { intent: "count_orders_last_days", filters: { lastDays } };
    }
    return {
      intent: "list_orders_last_days",
      filters: { lastDays, limit: extractTopN(q, 25) },
    };
  }

  // —— Count orders in a specific year ——
  if (asksCount && aboutOrders && extractYear(q) != null && !/\bby\s+year\b/.test(q)) {
    return {
      intent: "count_orders_by_year",
      filters: { year: extractYear(q) },
    };
  }

  // —— Customer ——
  const customerId = extractCustomerId(q);
  if (customerId != null && aboutOrders) {
    if (asksCount) {
      return { intent: "count_orders_for_customer", filters: { customerId } };
    }
    return {
      intent: "list_orders_for_customer",
      filters: { customerId, limit: extractTopN(q, 25) },
    };
  }

  // —— Salesperson ——
  const salesPersonId = extractSalesPersonId(q);
  if (salesPersonId != null && aboutOrders) {
    if (asksCount) {
      return { intent: "count_orders_for_salesperson", filters: { salesPersonId } };
    }
    return {
      intent: "list_orders_for_salesperson",
      filters: { salesPersonId, limit: extractTopN(q, 25) },
    };
  }

  // —— Status (specific status number) ——
  const status = extractStatus(q);
  if (status != null && aboutOrders) {
    // Explicit "list" only — "Orders with status 5" is a count (H087).
    if (/\blist\b/.test(q) && !asksCount) {
      return {
        intent: "list_orders_by_status",
        filters: { status, limit: extractTopN(q, 25) },
      };
    }
    return { intent: "count_orders_by_status", filters: { status } };
  }

  // —— Order by id (do not steal line-item / "how many lines" questions) ——
  const salesOrderId = extractSalesOrderId(q);
  if (
    salesOrderId != null &&
    (/\bsales\s+order\b/.test(q) || /\bwhat\s+is\s+sales\s+order\b/.test(q)) &&
    !/\btop\b/.test(q) &&
    !/\bby\s+year\b/.test(q) &&
    !/\blines?\b/.test(q) &&
    !/\border\s+details?\b/.test(q) &&
    !/\bline\s+items?\b/.test(q)
  ) {
    return { intent: "order_by_id", filters: { salesOrderId } };
  }

  // —— Top / lowest by value ——
  if (
    (/\btop\s+\d+\s+orders?\b/.test(q) && /\btotaldue\b/.test(q)) ||
    (/\btop\s+orders?\s+by\b/.test(q) && /\btotaldue\b/.test(q)) ||
    /\bhighest\s+value\s+sales?\s+orders?\b/.test(q)
  ) {
    return { intent: "top_orders_by_value", filters: { limit: extractTopN(q, 10) } };
  }
  if (
    /\blowest\s+value\s+sales?\s+orders?\b/.test(q) ||
    /\bcheapest\s+\d+\s+orders?\b/.test(q) ||
    (/\blowest\s+orders?\b/.test(q) && /\bvalue\b/.test(q))
  ) {
    return { intent: "lowest_orders_by_value", filters: { limit: extractTopN(q, 10) } };
  }

  // —— Min / max TotalDue lists ——
  const minTotalDue = extractMinTotalDue(q);
  if (minTotalDue != null && aboutOrders && !asksCount) {
    return {
      intent: "list_orders_min_value",
      filters: { minTotalDue, limit: extractTopN(q, 25) },
    };
  }
  const maxTotalDue = extractMaxTotalDue(q);
  if (maxTotalDue != null && aboutOrders && !asksCount) {
    return {
      intent: "list_orders_max_value",
      filters: { maxTotalDue, limit: extractTopN(q, 25) },
    };
  }

  // —— Year range list ——
  const years = extractYears(q);
  if (
    years &&
    years.length >= 2 &&
    aboutOrders &&
    (/\bbetween\b/.test(q) || /\brange\b/.test(q))
  ) {
    return {
      intent: "list_orders_year_range",
      filters: { minYear: years[0], maxYear: years[1], limit: extractTopN(q, 25) },
    };
  }

  // —— Fallback count sales orders ——
  if (
    asksCount &&
    !/\blines?\b/.test(q) &&
    !/\border\s+details?\b/.test(q) &&
    !/\bline\s+items?\b/.test(q) &&
    (/\bsales?\s+orders?\b/.test(q) ||
      (/\borders?\b/.test(q) && !aboutProducts && !/\bcustomers?\b/.test(q)))
  ) {
    return { intent: "count_sales_orders", filters: {} };
  }

  return null;
}

export const normalizeSalesOrderHeaderFilters = (
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...filters };

  if (
    (intent === "sales_value_over_period" ||
      intent === "average_order_value_over_period" ||
      intent === "count_orders_shipped_period") &&
    next.lastMonths == null
  ) {
    next.lastMonths = 3;
  }
  if (
    (intent === "count_orders_last_days" || intent === "list_orders_last_days") &&
    next.lastDays == null
  ) {
    next.lastDays = 30;
  }
  if (intent === "sales_orders_by_year") {
    const allowed = new Set(["orderYear", "orderCount", "salesValue"]);
    if (next.sort != null && !allowed.has(String(next.sort))) {
      delete next.sort;
      delete next.sortDir;
    }
    if (next.sortDir != null && next.sortDir !== "asc" && next.sortDir !== "desc") {
      next.sortDir = "asc";
    }
  }

  const listIntents = new Set([
    "list_orders_last_days",
    "list_orders_for_customer",
    "list_orders_for_salesperson",
    "list_orders_with_comments",
    "list_orders_by_status",
    "list_orders_min_value",
    "list_orders_max_value",
    "list_orders_year_range",
    "top_orders_by_value",
    "lowest_orders_by_value",
    "latest_orders",
    "oldest_orders",
    "sample_orders",
  ]);
  if (listIntents.has(intent) && next.limit == null) {
    next.limit =
      intent === "top_orders_by_value" ||
      intent === "lowest_orders_by_value" ||
      intent === "sample_orders"
        ? 10
        : intent === "latest_orders"
          ? 20
          : intent === "oldest_orders"
            ? 10
            : 25;
  }

  return next;
}
