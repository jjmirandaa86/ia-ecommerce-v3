/**
 * heuristic.ts — salesorderdetail phrase detection (line items / product sales).
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractCategory,
  extractColor,
  extractLastMonths,
  extractMaxListPrice,
  extractMaxUnitPrice,
  extractMinQty,
  extractProductId,
  extractProductIds,
  extractSalesOrderDetailId,
  extractSalesOrderId,
  extractTopN,
} from "@/query-agent/domain/tables/salesorderdetail/extract";

export const classifySalesOrderDetailHeuristic = (q: string): QueryPlan | null => {
  const aboutProducts = /\b(products?|productos?)\b/.test(q);
  const aboutLines =
    /\b(order\s+lines?|line\s+items?|order\s+details?|sales\s+order\s+details?|salesorderdetail)\b/.test(
      q,
    );
  const aboutQty =
    /\b(order\s*qty|orderqty|qty|quantity\s+sold|quantities\s+sold)\b/.test(q);
  const aboutRevenue =
    /\b(revenue|line\s+totals?|linetotal)\b/.test(q) ||
    /\bsales\s+revenue\b/.test(q);
  const aboutUnitPrice = /\bunit\s+price\b/.test(q);
  const aboutDiscount =
    /\b(discount(?:ed)?|discounts)\b/.test(q);
  const aboutTracking =
    /\b(carrier\s+tracking|tracking\s+number|tracking)\b/.test(q);
  const aboutSpecialOffer = /\bspecial\s+offer\b/.test(q);

  // Avoid bare "total" — it false-matches "line total" / "LineTotal".
  const asksCount =
    /\b(how many|count|number of)\b/.test(q) ||
    /\b(cu[aá]ntos?|cantidad)\b/.test(q);
  const asksAvg = /\b(average|avg|mean)\b/.test(q);
  const asksSum =
    /\bsum\b/.test(q) ||
    (/\btotal\b/.test(q) &&
      !/\bline\s+total\b/.test(q) &&
      !/\blinetotal\b/.test(q));
  const asksMin = /\b(min|minimum|lowest)\b/.test(q);
  const asksMax = /\b(max|maximum|highest)\b/.test(q);

  // Order-level / review questions belong elsewhere.
  if (
    /\blast\s+sale\b/.test(q) ||
    /\bsales?\s+value\b/.test(q) ||
    /\baverage\s+order\s+value\b/.test(q) ||
    /\b(reviews?|ratings?)\b/.test(q)
  ) {
    return null;
  }
  // Pure sales-order counts — do not steal line-scoped questions.
  if (
    asksCount &&
    /\bsales?\s+orders?\b/.test(q) &&
    !aboutLines &&
    !/\blines?\b/.test(q) &&
    !/\bline\s+items?\b/.test(q)
  ) {
    return null;
  }
  // "How many products are there?" — product module.
  if (
    asksCount &&
    aboutProducts &&
    !aboutLines &&
    !/\blines?\b/.test(q) &&
    !/\bsold\b/.test(q) &&
    !/\border\b/.test(q) &&
    !/\bdistinct\b/.test(q) &&
    !/\bnever\b/.test(q)
  ) {
    return null;
  }

  // —— Line by id ——
  const detailId = extractSalesOrderDetailId(q);
  if (
    detailId != null &&
    (/\border\s+detail\b/.test(q) ||
      /\bsales\s+order\s+detail\b/.test(q) ||
      /\bline\s+(?:item\s+)?id\b/.test(q))
  ) {
    return {
      intent: "line_by_id",
      filters: { salesOrderDetailId: detailId },
    };
  }

  // —— Compare two products ——
  const productIds = extractProductIds(q);
  if (
    productIds.length >= 2 &&
    (/\bcompare\b/.test(q) || /\bvs\b/.test(q)) &&
    aboutQty
  ) {
    return {
      intent: "compare_product_qty",
      filters: { productIds: productIds.slice(0, 2) },
    };
  }

  // —— Per-order / per-product line lookups ——
  const salesOrderId = extractSalesOrderId(q);
  if (salesOrderId != null && aboutLines) {
    if (asksCount || /\bhow many\b/.test(q)) {
      return {
        intent: "count_lines_for_order",
        filters: { salesOrderId },
      };
    }
    if (/\b(show|list|display)\b/.test(q) || /\bfor\s+sales\s+order\b/.test(q)) {
      return {
        intent: "list_lines_for_order",
        filters: { salesOrderId, limit: extractTopN(q, 25) },
      };
    }
  }
  // "Show order details for sales order 43659" — aboutLines may use order details
  if (
    salesOrderId != null &&
    /\border\s+details?\b/.test(q) &&
    (/\bshow\b/.test(q) || /\bfor\s+sales\s+order\b/.test(q))
  ) {
    return {
      intent: "list_lines_for_order",
      filters: { salesOrderId, limit: extractTopN(q, 25) },
    };
  }
  if (salesOrderId != null && /\bhow many\s+lines?\b/.test(q)) {
    return {
      intent: "count_lines_for_order",
      filters: { salesOrderId },
    };
  }

  const productId = extractProductId(q);
  if (productId != null) {
    if (/\bpct\b/.test(q) || /\bpercent(?:age)?\b/.test(q)) {
      return {
        intent: "pct_lines_for_product",
        filters: { productId },
      };
    }
    if (
      asksCount &&
      (/\btimes?\b/.test(q) || aboutLines || /\bsold\b/.test(q))
    ) {
      // "How many times was product 776 sold?"
      if (/\btimes?\b/.test(q) || aboutLines) {
        return {
          intent: "count_lines_for_product",
          filters: { productId },
        };
      }
    }
    if (
      (/\bquantity\s+sold\b/.test(q) || /\bqty\s+sold\b/.test(q)) &&
      /\bfor\s+product\b/.test(q)
    ) {
      return {
        intent: "sales_qty_for_product",
        filters: { productId },
      };
    }
    if (
      (/\bshow\b/.test(q) || /\blist\b/.test(q)) &&
      aboutLines &&
      /\bfor\s+product\b/.test(q)
    ) {
      return {
        intent: "list_lines_for_product",
        filters: { productId, limit: extractTopN(q, 25) },
      };
    }
  }

  // —— Discounted lines ——
  if (aboutDiscount && asksCount) {
    return { intent: "count_discounted_lines", filters: {} };
  }
  if (
    aboutDiscount &&
    (/\blines?\b/.test(q) || aboutLines) &&
    (/\bgreater\s+than\s+0\b/.test(q) || /\blist\b/.test(q) || /\bwith\s+discount\b/.test(q))
  ) {
    return {
      intent: "list_discounted_lines",
      filters: { limit: extractTopN(q, 25) },
    };
  }
  if (aboutDiscount && asksSum) {
    return { intent: "sum_line_discount", filters: {} };
  }

  // —— Tracking ——
  if (aboutTracking && asksCount && /\bpresence\b/.test(q)) {
    return { intent: "count_lines_with_tracking", filters: {} };
  }
  if (
    aboutTracking &&
    (/\bwithout\b/.test(q) || /\bno\b/.test(q)) &&
    aboutLines
  ) {
    return {
      intent: "list_lines_without_tracking",
      filters: { limit: extractTopN(q, 25) },
    };
  }
  if (aboutTracking && asksCount) {
    return { intent: "count_lines_with_tracking", filters: {} };
  }

  // —— Special offer ——
  if (aboutSpecialOffer && (asksCount || /\busage\b/.test(q))) {
    return { intent: "count_lines_by_special_offer", filters: {} };
  }

  // —— Online order lines ——
  if (
    aboutLines &&
    /\bonline\s+orders?\b/.test(q) &&
    (asksCount || /\bhow many\b/.test(q))
  ) {
    return { intent: "count_lines_online_orders", filters: {} };
  }

  // —— Avg / min / max line metrics ——
  if (asksAvg && /\blines?\s+per\s+(?:sales\s+)?order\b/.test(q)) {
    return { intent: "avg_lines_per_order", filters: {} };
  }
  if (
    /\bsales\s+orders?\b/.test(q) &&
    /\bmost\s+line\b/.test(q)
  ) {
    return {
      intent: "orders_most_lines",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (asksMin && /\bline\s+total\b/.test(q)) {
    return { intent: "min_line_total", filters: {} };
  }
  if (asksMax && /\bline\s+total\b/.test(q)) {
    return { intent: "max_line_total", filters: {} };
  }
  if (asksAvg && /\bline\s+total\b/.test(q)) {
    return { intent: "avg_line_total", filters: {} };
  }

  if (asksAvg && aboutUnitPrice && /\bby\s+product\b/.test(q)) {
    return { intent: "avg_unit_price_by_product", filters: {} };
  }
  if (asksAvg && aboutUnitPrice) {
    return { intent: "avg_unit_price", filters: {} };
  }

  if (asksAvg && aboutQty && /\bby\s+product\b/.test(q)) {
    return { intent: "avg_qty_by_product", filters: {} };
  }
  if (
    asksAvg &&
    (/\border\s+quantity\b/.test(q) || /\border\s+qty\b/.test(q)) &&
    /\bper\s+line\b/.test(q)
  ) {
    return { intent: "avg_order_qty", filters: {} };
  }
  if (asksAvg && (/\border\s+qty\b/.test(q) || /\border\s+quantity\b/.test(q))) {
    return { intent: "avg_order_qty", filters: {} };
  }

  if (/\bmedian\b/.test(q) && (/\border\s+qty\b/.test(q) || aboutQty)) {
    return { intent: "median_order_qty", filters: {} };
  }
  if (/\bvariance\b/.test(q) && (/\border\s+qty\b/.test(q) || aboutQty)) {
    return { intent: "variance_order_qty", filters: {} };
  }

  if (
    asksMax &&
    (/\border\s+qty\b/.test(q) || /\border\s+quantity\b/.test(q)) &&
    /\b(single\s+)?line\b/.test(q)
  ) {
    return { intent: "max_order_qty", filters: {} };
  }
  if (
    asksMin &&
    (/\border\s+qty\b/.test(q) || /\border\s+quantity\b/.test(q)) &&
    /\b(single\s+)?line\b/.test(q)
  ) {
    return { intent: "min_order_qty", filters: {} };
  }

  // —— Filtered line lists ——
  const minQty = extractMinQty(q);
  if (minQty != null && (aboutLines || /\border\s+details?\b/.test(q))) {
    return {
      intent: "list_lines_min_qty",
      filters: { minQty, limit: extractTopN(q, 25) },
    };
  }
  const maxUnitPrice = extractMaxUnitPrice(q);
  if (maxUnitPrice != null && (/\blines?\b/.test(q) || aboutLines)) {
    return {
      intent: "list_lines_max_unit_price",
      filters: { maxUnitPrice, limit: extractTopN(q, 25) },
    };
  }

  const color = extractColor(q);
  if (
    color &&
    (/\border\s+details?\b/.test(q) || aboutLines) &&
    aboutProducts
  ) {
    return {
      intent: "list_lines_for_color",
      filters: { color, limit: extractTopN(q, 25) },
    };
  }

  // —— Sample / latest ——
  if (
    /\b(random\s+)?sample\b/.test(q) &&
    aboutLines
  ) {
    return {
      intent: "sample_order_lines",
      filters: { limit: extractTopN(q, 15) },
    };
  }
  if (/\blatest\b/.test(q) && aboutLines) {
    return {
      intent: "latest_order_lines",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  // —— Distinct / never sold / list sold ——
  if (
    asksCount &&
    /\bdistinct\s+products?\b/.test(q) &&
    (aboutLines || /\bsold\b/.test(q) || /\bappear\b/.test(q))
  ) {
    return { intent: "count_distinct_products_sold", filters: {} };
  }
  if (
    aboutProducts &&
    (/\bnever\s+sold\b/.test(q) || /\bnot\s+sold\b/.test(q))
  ) {
    return { intent: "count_products_never_sold", filters: {} };
  }
  if (
    aboutProducts &&
    /\blist\b/.test(q) &&
    /\b(have\s+been\s+)?sold\b/.test(q) &&
    !/\btop\b/.test(q) &&
    !/\bleast\b/.test(q)
  ) {
    return {
      intent: "list_sold_products",
      filters: { limit: extractTopN(q, 25) },
    };
  }

  // —— By year ——
  if (aboutQty && /\bby\s+year\b/.test(q)) {
    return { intent: "sales_qty_by_year", filters: {} };
  }
  if (aboutRevenue && /\bby\s+year\b/.test(q)) {
    return { intent: "line_total_by_year", filters: {} };
  }

  // —— Category / subcategory / color aggregates ——
  const category = extractCategory(q);

  if (asksSum && aboutQty && category) {
    return {
      intent: "sum_order_qty_category",
      filters: { category },
    };
  }
  if (aboutQty && /\bby\s+categor(?:y|ies)\b/.test(q)) {
    return { intent: "sales_qty_by_category", filters: {} };
  }
  if (aboutRevenue && /\bby\s+categor(?:y|ies)\b/.test(q)) {
    return { intent: "line_total_by_category", filters: {} };
  }
  if (aboutQty && /\bby\s+subcategor(?:y|ies)\b/.test(q)) {
    return { intent: "sales_qty_by_subcategory", filters: {} };
  }
  if (aboutQty && /\bby\s+(?:product\s+)?colou?r\b/.test(q)) {
    return { intent: "sales_qty_by_color", filters: {} };
  }

  // —— Period qty / top ——
  if (
    aboutQty &&
    (/\blast\s+\d+\s+months?\b/.test(q) || /\bover\s+the\s+last\b/.test(q)) &&
    !/\btop\b/.test(q) &&
    !/\bselling\b/.test(q)
  ) {
    return {
      intent: "sum_order_qty_period",
      filters: { lastMonths: extractLastMonths(q, 3) },
    };
  }

  // —— Make flag / finished goods qty ——
  if (
    aboutQty &&
    (/\bmake\s+flag\b/.test(q) || /\bmakeflag\b/.test(q))
  ) {
    return { intent: "sum_order_qty_make_flag", filters: {} };
  }
  if (aboutQty && /\bfinished\s+goods\b/.test(q)) {
    return { intent: "sum_order_qty_finished_goods", filters: {} };
  }

  // —— Revenue rankings ——
  if (
    aboutProducts &&
    (/\btop\b/.test(q) || /\bmost\b/.test(q)) &&
    (/\bby\s+revenue\b/.test(q) || /\bby\s+line\s+total\b/.test(q))
  ) {
    return {
      intent: "top_products_by_revenue",
      filters: { limit: extractTopN(q, 10) },
    };
  }
  if (
    aboutProducts &&
    /\bleast\b/.test(q) &&
    /\bby\s+revenue\b/.test(q)
  ) {
    return {
      intent: "least_products_by_revenue",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  // —— Line total sum / by product ——
  if (
    (asksSum || /\btotal\b/.test(q)) &&
    (/\bline\s+totals?\b/.test(q) || /\blinetotal\b/.test(q)) &&
    !/\bby\b/.test(q)
  ) {
    return { intent: "sum_line_total", filters: {} };
  }
  if (
    (/\bline\s+total\b/.test(q) || /\bsales\s+revenue\b/.test(q)) &&
    /\bby\s+product\b/.test(q)
  ) {
    return { intent: "line_total_by_product", filters: {} };
  }

  // —— Top / least with category, color, period, max price ——
  const maxPrice = extractMaxListPrice(q);
  if (
    aboutProducts &&
    (/\btop\s+selling\b/.test(q) ||
      (/\btop\b/.test(q) && /\bselling\b/.test(q))) &&
    maxPrice != null
  ) {
    return {
      intent: "top_products_by_sales_max_price",
      filters: { maxPrice, limit: extractTopN(q, 10) },
    };
  }
  if (
    aboutProducts &&
    (/\btop\s+selling\b/.test(q) ||
      (/\btop\b/.test(q) && /\bselling\b/.test(q))) &&
    (/\blast\s+\d+\s+months?\b/.test(q) || /\bover\s+the\s+last\b/.test(q))
  ) {
    return {
      intent: "top_products_by_sales_period",
      filters: {
        lastMonths: extractLastMonths(q, 12),
        limit: extractTopN(q, 10),
      },
    };
  }
  if (
    aboutProducts &&
    category &&
    (/\btop\s+selling\b/.test(q) ||
      (/\btop\b/.test(q) && /\bselling\b/.test(q)) ||
      /\bmost\s+sold\b/.test(q))
  ) {
    return {
      intent: "top_products_by_sales_category",
      filters: { category, limit: extractTopN(q, 10) },
    };
  }
  if (
    aboutProducts &&
    category &&
    (/\bleast\s+sold\b/.test(q) || /\bleast\s+selling\b/.test(q))
  ) {
    return {
      intent: "least_sold_products_category",
      filters: { category, limit: extractTopN(q, 10) },
    };
  }
  if (
    aboutProducts &&
    color &&
    (/\btop\s+selling\b/.test(q) ||
      (/\btop\b/.test(q) && /\bselling\b/.test(q)))
  ) {
    return {
      intent: "top_products_by_sales_color",
      filters: { color, limit: extractTopN(q, 10) },
    };
  }

  // —— Classic top / least sold (incl. "sell the most/least") ——
  if (
    (/\btop\s+selling\b/.test(q) && aboutProducts) ||
    (/\btop\s+\d+\b/.test(q) && /\bselling\b/.test(q) && aboutProducts) ||
    (/\bmost\s+sold\b/.test(q) && aboutProducts) ||
    (/\bbest\s+selling\b/.test(q) && aboutProducts) ||
    (/\bsell\s+the\s+most\b/.test(q) && aboutProducts) ||
    (/\bselling\s+products?\b/.test(q) &&
      /\btop\b/.test(q) &&
      aboutProducts) ||
    (/\bby\s+orderqty\b/.test(q) && /\btop\b/.test(q) && aboutProducts)
  ) {
    return {
      intent: "top_products_by_sales",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (
    (/\bleast\s+sold\b/.test(q) && aboutProducts) ||
    (/\bleast\s+\d+\s+sold\b/.test(q) && aboutProducts) ||
    (/\bleast\s+selling\b/.test(q) && aboutProducts) ||
    (/\bfewest\s+sold\b/.test(q) && aboutProducts) ||
    (/\bsell\s+the\s+least\b/.test(q) && aboutProducts)
  ) {
    return {
      intent: "least_sold_products",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  // —— Qty by product ——
  if (
    /\bsales?\s+qty\s+by\s+product\b/.test(q) ||
    /\bquantity\s+sold\s+by\s+product\b/.test(q) ||
    (/\border\s+qty\b/.test(q) && /\bby\s+product\b/.test(q)) ||
    (/\bquantity\s+sold\b/.test(q) && /\bby\s+product\b/.test(q)) ||
    (/\bquantity\s+sold\b/.test(q) && /\bgrouped\s+by\s+product\b/.test(q)) ||
    (/\branked\s+by\s+quantity\s+sold\b/.test(q) && aboutProducts) ||
    (/\border\s+qty\s+by\s+product\b/.test(q))
  ) {
    return { intent: "sales_qty_by_product", filters: {} };
  }

  // —— Sum order qty (generic; after specialized qty intents) ——
  if (
    (/\bsum\b/.test(q) || (/\btotal\b/.test(q) && !asksCount)) &&
    (/\border\s*qty\b/.test(q) ||
      /\borderqty\b/.test(q) ||
      (/\bqty\b/.test(q) && !/\bby\b/.test(q)) ||
      /\bquantity\s+sold\b/.test(q)) &&
    !/\bby\b/.test(q) &&
    !category &&
    !/\bfinished\s+goods\b/.test(q) &&
    !/\bmake\s+flag\b/.test(q) &&
    !/\blast\s+\d+\s+months?\b/.test(q)
  ) {
    return { intent: "sum_order_qty", filters: {} };
  }

  // —— Count order lines (generic) ——
  if (asksCount && aboutLines) {
    return { intent: "count_order_lines", filters: {} };
  }

  return null;
}

const LIMIT_DEFAULT_INTENTS = new Set([
  "top_products_by_sales",
  "least_sold_products",
  "top_products_by_revenue",
  "least_products_by_revenue",
  "top_products_by_sales_category",
  "least_sold_products_category",
  "top_products_by_sales_color",
  "top_products_by_sales_period",
  "top_products_by_sales_max_price",
  "orders_most_lines",
  "list_sold_products",
  "list_lines_for_order",
  "list_lines_for_product",
  "list_lines_min_qty",
  "list_lines_max_unit_price",
  "list_discounted_lines",
  "list_lines_without_tracking",
  "list_lines_for_color",
  "sample_order_lines",
  "latest_order_lines",
]);

export const normalizeSalesOrderDetailFilters = (
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...filters };
  if (LIMIT_DEFAULT_INTENTS.has(intent) && next.limit == null) {
    if (
      intent.startsWith("list_") ||
      intent === "list_sold_products" ||
      intent === "sample_order_lines"
    ) {
      next.limit = intent === "sample_order_lines" ? 15 : 25;
    } else if (intent === "latest_order_lines") {
      next.limit = 10;
    } else {
      next.limit = 10;
    }
  }
  if (
    (intent === "top_products_by_sales_period" ||
      intent === "sum_order_qty_period") &&
    next.lastMonths == null
  ) {
    next.lastMonths = intent === "top_products_by_sales_period" ? 12 : 3;
  }
  return next;
}
