/**
 * heuristic.ts — Product phrase detection (fast path).
 * Maps natural-language questions to a QueryPlan via regex rules
 * and normalizes default filters. Does not build SQL or format answers.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractCategories,
  extractCategory,
  extractColor,
  extractColors,
  extractMaxPrice,
  extractMaxWeight,
  extractMinPrice,
  extractNameContains,
  extractProductId,
  extractProductLine,
  extractProductNumberPrefix,
  extractSize,
  extractSubcategory,
  extractTopN,
  extractYear,
  hasMaxPriceCue,
  hasMinPriceCue,
  normalizeColor,
} from "@/query-agent/domain/tables/shared";

export const classifyProductHeuristic = (q: string): QueryPlan | null => {
  const aboutProducts =
    /\bproducts\b/.test(q) ||
    /\bproductos?\b/.test(q) ||
    (/\bproduct\b/.test(q) && !/\bproduct\s+(?:sub)?categor/.test(q) && !/\bproduct\s+line\b/.test(q) && !/\bproduct\s+model\b/.test(q) && !/\bproduct\s+number\b/.test(q));

  const bySubcategory =
    /\b(per|by|por)\s+subcategor(y|ies|ía|ias)?\b/.test(q) ||
    /\bproducts?\s+by\s+subcategor/.test(q);

  const byCategory =
    /\b(per|by|por)\s+(?<!sub)categor(y|ies|ía|ias)?\b/.test(q) ||
    /\bproducts?\s+by\s+(?!sub)categor/.test(q) ||
    /\bgrouped\s+by\s+(?!sub)categor/.test(q) ||
    /\bacross\s+categor/.test(q);

  const byColor =
    /\b(per|by|por)\s+colou?r\b/.test(q) ||
    /\bproducts?\s+by\s+colou?r\b/.test(q) ||
    /\bbreak\s+down\s+products?\s+by\s+colou?r\b/.test(q);

  const bySize =
    /\b(per|by|por)\s+size\b/.test(q) || /\bproducts?\s+by\s+size\b/.test(q);
  const byClass =
    /\b(per|by|por)\s+class\b/.test(q) || /\bproducts?\s+by\s+class\b/.test(q);
  const byStyle =
    /\b(per|by|por)\s+style\b/.test(q) || /\bproducts?\s+by\s+style\b/.test(q);

  const aboutListPrice =
    /\b(list\s*price|listprice|price|precio|prices|cost|priced)\b/.test(q);

  const asksAvg =
    /\b(average|avg|mean|promedio)\b/.test(q) &&
    (aboutListPrice || /\bmargin\b/.test(q) || /\bweight\b/.test(q) || /\bdays\s+to\s+manufacture\b/.test(q));

  const asksMin = /\b(minimum|min)\b/.test(q) && aboutListPrice;
  const asksMax = /\b(maximum|max)\b/.test(q) && aboutListPrice;
  const asksSum =
    /\b(sum|total)\s+of\s+(list\s*)?prices?\b/.test(q) ||
    (/\bsum\b/.test(q) && aboutListPrice && byCategory);

  const asksCount =
    /\b(how many|count|number of|total)\b/.test(q) ||
    /\b(cu[aá]ntos?|cuantas|cantidad|total de)\b/.test(q) ||
    /\bgive\s+total\b/.test(q);

  // —— Compare averages ——
  if (/\bcompare\b/.test(q) && asksAvg && /\bvs\b|\bversus\b|\band\b/.test(q)) {
    const cats = extractCategories(q);
    if (cats.length >= 2) {
      return {
        intent: "compare_avg_price_categories",
        filters: { categories: cats.slice(0, 2) },
      };
    }
  }

  // —— Price aggregates ——
  if (asksAvg && /\bmargin\b/.test(q) && byCategory) {
    return { intent: "avg_margin_by_category", filters: {} };
  }
  if (asksAvg && /\bweight\b/.test(q) && byCategory) {
    return { intent: "avg_weight_by_category", filters: {} };
  }
  if (asksAvg && /\bdays\s+to\s+manufacture\b/.test(q) && byCategory) {
    return { intent: "avg_days_to_manufacture_by_category", filters: {} };
  }
  if (asksAvg && bySubcategory) {
    return { intent: "avg_list_price_by_subcategory", filters: {} };
  }
  if (asksAvg && byCategory && !bySubcategory) {
    return { intent: "avg_list_price_by_category", filters: {} };
  }
  if (asksAvg && byColor) {
    return { intent: "avg_list_price_by_color", filters: {} };
  }
  if (
    asksAvg &&
    aboutListPrice &&
    !byCategory &&
    !bySubcategory &&
    !byColor
  ) {
    const category = extractCategory(q);
    if (category) {
      return { intent: "avg_list_price", filters: { category } };
    }
    if (
      /\boverall\b/.test(q) ||
      (/\baverage\s+(list\s*)?price\b/.test(q) && !/\bby\b|\bper\b/.test(q))
    ) {
      return { intent: "avg_list_price", filters: {} };
    }
  }

  // Median (before generic avg phrasing collisions)
  if (
    /\bmedian\b/.test(q) &&
    aboutListPrice &&
    !byCategory &&
    !bySubcategory &&
    !byColor
  ) {
    return { intent: "median_list_price", filters: {} };
  }

  if (asksMin && byCategory && !bySubcategory) {
    return { intent: "min_list_price_by_category", filters: {} };
  }
  if (asksMax && byCategory && !bySubcategory) {
    return { intent: "max_list_price_by_category", filters: {} };
  }
  if (asksSum && byCategory && !bySubcategory) {
    return { intent: "sum_list_price_by_category", filters: {} };
  }

  // —— Group counts ——
  if (aboutProducts && bySubcategory) {
    return { intent: "products_by_subcategory", filters: {} };
  }
  if (aboutProducts && byCategory) {
    return { intent: "products_by_category", filters: {} };
  }
  if (aboutProducts && byColor) {
    return { intent: "products_by_color", filters: {} };
  }
  if ((aboutProducts || /\blist\b/.test(q)) && bySize) {
    return { intent: "products_by_size", filters: {} };
  }
  if ((aboutProducts || /\blist\b/.test(q)) && byClass) {
    return { intent: "products_by_class", filters: {} };
  }
  if ((aboutProducts || /\blist\b/.test(q)) && byStyle) {
    return { intent: "products_by_style", filters: {} };
  }
  if (
    (asksCount && /\bper\s+product\s+model\b/.test(q)) ||
    /\bproducts?\s+per\s+product\s+model\b/.test(q)
  ) {
    return { intent: "products_by_model", filters: {} };
  }
  if (asksCount && /\bproduct\s+model\b/.test(q) && aboutProducts) {
    return { intent: "products_by_model", filters: {} };
  }

  // —— Without / with attributes ——
  const withoutSubcategory =
    /\b(no|without|missing|null|empty)\s+(a\s+)?subcategor/.test(q) ||
    /\bhave\s+no\s+subcategor/.test(q) ||
    /\bmissing\s+a\s+subcategor/.test(q);

  if (aboutProducts && withoutSubcategory) {
    return { intent: "count_products_without_subcategory", filters: {} };
  }

  const withoutColor =
    /\b(no|without|missing|null|empty)\s+colou?r\b/.test(q) ||
    /\bhave\s+no\s+colou?r\b/.test(q);
  if (aboutProducts && withoutColor) {
    return { intent: "count_products_without_color", filters: {} };
  }

  const withColorAssigned =
    /\bhave\s+a\s+colou?r\s+assigned\b/.test(q) ||
    /\bwith\s+(a\s+)?colou?r\s+assigned\b/.test(q) ||
    (/\bhave\s+(a\s+)?colou?r\b/.test(q) && !/\breviews?\b/.test(q));
  if (asksCount && aboutProducts && withColorAssigned && !withoutColor) {
    return { intent: "count_products_with_color", filters: {} };
  }

  if (
    aboutProducts &&
    (/\bwithout\s+(a\s+)?product\s+model\b/.test(q) ||
      /\bno\s+product\s+model\b/.test(q))
  ) {
    return { intent: "count_products_without_model", filters: {} };
  }

  // —— Catalog counts / lists ——
  if (asksCount && /\bproduct\s+subcategor(y|ies)\b/.test(q)) {
    return { intent: "count_subcategories", filters: {} };
  }
  if (asksCount && /\bproduct\s+categor(y|ies)\b/.test(q)) {
    return { intent: "count_categories", filters: {} };
  }
  if (asksCount && /\bunique\s+colou?rs?\b/.test(q) && aboutProducts) {
    return { intent: "count_distinct_colors", filters: {} };
  }
  if (/\blist\s+all\s+product\s+subcategor/.test(q)) {
    return { intent: "list_subcategories", filters: {} };
  }
  if (/\blist\s+all\s+product\s+categor/.test(q)) {
    return { intent: "list_categories", filters: {} };
  }
  if (
    /\bdistinct\s+product\s+lines\b/.test(q) ||
    /\blist\s+product\s+lines\b/.test(q)
  ) {
    return { intent: "list_product_lines", filters: {} };
  }

  // —— Which most/fewest ——
  if (
    /\b(which|what)\s+categor(y|ies)\b/.test(q) &&
    /\b(most|highest|largest|max)\b/.test(q) &&
    aboutProducts
  ) {
    return { intent: "top_category_by_product_count", filters: {} };
  }
  if (
    /\b(which|what)\s+subcategor(y|ies)\b/.test(q) &&
    /\b(fewest|least|lowest|smallest|min)\b/.test(q) &&
    aboutProducts
  ) {
    return { intent: "bottom_subcategory_by_product_count", filters: {} };
  }
  if (
    /\b(which|what)\s+colou?r\b/.test(q) &&
    /\b(most\s+common|most|highest|popular)\b/.test(q) &&
    aboutProducts
  ) {
    return { intent: "top_color_by_product_count", filters: {} };
  }

  // —— Subcategories belong / category for ——
  if (
    /\bsubcategor/.test(q) &&
    /\bbelong\b/.test(q) &&
    extractCategory(q)
  ) {
    return {
      intent: "subcategories_by_category",
      filters: { category: extractCategory(q) },
    };
  }
  if (
    /\bcategor(?:y|ies)\s+for\s+subcategor/.test(q) ||
    (/\bcategor(?:y|ies)\s+for\b/.test(q) && extractSubcategory(q))
  ) {
    const sub = extractSubcategory(q);
    if (sub) return { intent: "category_for_subcategory", filters: { subcategory: sub } };
  }

  // —— Flag / lifecycle counts ——
  if (asksCount && aboutProducts && /\bmake-?to-?order\b/.test(q)) {
    return {
      intent: "count_products_make_flag",
      filters: { makeFlag: true },
    };
  }
  if (asksCount && /\bfinished\s+goods\b/.test(q)) {
    return { intent: "count_finished_goods", filters: {} };
  }
  if (asksCount && aboutProducts && /\bsellable\b/.test(q)) {
    return { intent: "count_sellable_products", filters: {} };
  }
  if (
    aboutProducts &&
    /\bsafety\s+stock\b/.test(q) &&
    /\b(zero|0|equal\s+to\s+zero)\b/.test(q)
  ) {
    return { intent: "count_products_zero_safety_stock", filters: {} };
  }
  if (
    aboutProducts &&
    (/\b(zero|0)\s+list\s*price\b/.test(q) || /\bzero\s+list\s+price\b/.test(q))
  ) {
    return { intent: "count_products_zero_price", filters: {} };
  }
  if (/\bdiscontinued\b/.test(q) && aboutProducts) {
    return { intent: "list_discontinued_products", filters: { limit: 25 } };
  }

  // —— Count under / over price ——
  if (
    asksCount &&
    aboutProducts &&
    /\b(cost|price|priced)\b/.test(q) &&
    hasMaxPriceCue(q)
  ) {
    return {
      intent: "count_products_under_price",
      filters: { maxPrice: extractMaxPrice(q, 20) },
    };
  }
  if (
    asksCount &&
    aboutProducts &&
    /\b(cost|price|priced)\b/.test(q) &&
    hasMinPriceCue(q) &&
    !hasMaxPriceCue(q)
  ) {
    return {
      intent: "count_products_over_price",
      filters: { minPrice: extractMinPrice(q, 500) ?? 500 },
    };
  }

  // —— Count in category ——
  if (asksCount && aboutProducts && extractCategory(q) && !byCategory) {
    return {
      intent: "count_products",
      filters: { category: extractCategory(q) },
    };
  }

  // —— Product by id ——
  const productId = extractProductId(q);
  if (
    productId != null &&
    !/\b(customers?|stock|inventory|bought|purchase)\b/.test(q)
  ) {
    if (/\blist\s+price\b/.test(q)) {
      return {
        intent: "product_list_price_by_id",
        filters: { productId },
      };
    }
    if (/\bshow\b/.test(q) || /\bproduct\s+\d+\b/.test(q)) {
      return { intent: "product_by_id", filters: { productId } };
    }
  }

  // —— Ranking ——
  const cheapestUnder =
    /\b(cheapest|lowest\s+price|baratos?)\b/.test(q) &&
    /\b(under|below|less\s+than|menos\s+de|\$\d+)/.test(q);
  if (aboutProducts && cheapestUnder) {
    return {
      intent: "cheapest_products_under_price",
      filters: {
        maxPrice: extractMaxPrice(q, 50),
        limit: extractTopN(q, 25),
      },
    };
  }

  if (
    /\b(the\s+)?cheapest\s+product\b/.test(q) &&
    !/\bproducts\b/.test(q) &&
    !hasMaxPriceCue(q)
  ) {
    return { intent: "cheapest_product", filters: {} };
  }
  if (
    /\b(the\s+)?most\s+expensive\s+product\b/.test(q) &&
    !/\bproducts\b/.test(q) &&
    !/\btop\s+\d+/.test(q)
  ) {
    return { intent: "most_expensive_product", filters: {} };
  }

  if (
    (aboutProducts && /\btop\s+\d+\s+cheapest\b/.test(q)) ||
    (/\bcheapest\s+products\b/.test(q) &&
      /\btop\s+\d+\b/.test(q) &&
      !hasMaxPriceCue(q))
  ) {
    return {
      intent: "top_cheapest_products",
      filters: { limit: extractTopN(q, 20) },
    };
  }

  if (/\bheaviest\b/.test(q) && aboutProducts) {
    return {
      intent: "top_heavy_products",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (/\blightest\b/.test(q) && aboutProducts && extractMaxWeight(q) != null) {
    return {
      intent: "list_products_by_weight",
      filters: {
        maxWeight: extractMaxWeight(q),
        limit: extractTopN(q, 25),
      },
    };
  }

  if (
    aboutProducts &&
    /\blist\s+price\s+greater\s+than\s+standard\s+cost\b/.test(q)
  ) {
    return { intent: "products_price_above_cost", filters: { limit: 25 } };
  }

  if (/\bnewest\b/.test(q) && /\bsell\s+start\b/.test(q) && aboutProducts) {
    return {
      intent: "newest_products_by_sell_start",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (/\brandom\s+sample\b/.test(q) && aboutProducts) {
    return {
      intent: "sample_products",
      filters: { limit: extractTopN(q, 15) },
    };
  }

  const expensive =
    /\b(most\s+expensive|highest\s+price|top\s+\d+\s+most\s+expensive|caros?|expensive)\b/.test(
      q,
    );
  if ((aboutProducts || extractCategory(q)) && expensive) {
    const filters: Record<string, unknown> = {
      limit: extractTopN(q, 10),
    };
    // "top 3" / "only top 3"
    const topOnly = q.match(/\btop\s+(\d+)\b/);
    if (topOnly) filters.limit = Number(topOnly[1]);
    const category = extractCategory(q);
    if (category) filters.category = category;
    return { intent: "top_expensive_products", filters };
  }

  // —— list_products (1=1 filters) ——
  const filters: Record<string, unknown> = { limit: extractTopN(q, 25) };
  let hasListFilter = false;

  if (hasMaxPriceCue(q)) {
    filters.maxPrice = extractMaxPrice(q, 40);
    hasListFilter = true;
  }
  const minP = extractMinPrice(q, 0);
  if (hasMinPriceCue(q) && minP != null) {
    filters.minPrice = minP;
    hasListFilter = true;
  }

  const colors = extractColors(q);
  if (colors.length > 1) {
    filters.colors = colors;
    hasListFilter = true;
  } else {
    const color = extractColor(q);
    if (color) {
      filters.color = color;
      hasListFilter = true;
    }
  }

  const size = extractSize(q);
  if (size) {
    filters.size = size;
    hasListFilter = true;
  }

  const category = extractCategory(q);
  if (category && (/\bin\s+categor/.test(q) || /\bcategor(?:y|ies)\s+/.test(q) || hasListFilter || /\blist\b/.test(q))) {
    filters.category = category;
    hasListFilter = true;
  }

  const subcategory = extractSubcategory(q);
  if (subcategory) {
    filters.subcategory = subcategory;
    hasListFilter = true;
  }

  const nameContains = extractNameContains(q);
  if (nameContains) {
    filters.nameContains = nameContains;
    hasListFilter = true;
  }

  const prefix = extractProductNumberPrefix(q);
  if (prefix) {
    filters.productNumberPrefix = prefix;
    hasListFilter = true;
  }

  const productLine = extractProductLine(q);
  if (productLine) {
    filters.productLine = productLine;
    hasListFilter = true;
  }

  const year = extractYear(q);
  if (year && /\bsell\s+start\b/.test(q)) {
    filters.sellStartYear = year;
    hasListFilter = true;
  }

  if (/\bnot\s+finished\s+goods\b/.test(q)) {
    filters.finishedGoodsFlag = false;
    hasListFilter = true;
  }

  if (/\bmore\s+than\s+(\d+)\s+days\s+to\s+manufacture\b/.test(q)) {
    const m = q.match(/\bmore\s+than\s+(\d+)\s+days/);
    filters.minDaysToManufacture = m ? Number(m[1]) : 3;
    hasListFilter = true;
  }

  if (/\breorder\s+point\s+above\s+(\d+)/.test(q)) {
    const m = q.match(/\breorder\s+point\s+above\s+(\d+)/);
    filters.minReorderPoint = m ? Number(m[1]) : 500;
    hasListFilter = true;
  }

  if (aboutProducts && hasListFilter) {
    return { intent: "list_products", filters };
  }

  // —— Generic product count ——
  if (asksCount && aboutProducts) {
    if (
      /\b(reviews?|reseñas?|calificaciones?|customers?|clientes?|stock|inventory)\b/.test(
        q,
      )
    ) {
      return null;
    }
    return { intent: "count_products", filters: {} };
  }

  return null;
}

export const normalizeProductFilters = (
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...filters };
  if (
    (intent === "top_expensive_products" ||
      intent === "top_cheapest_products" ||
      intent === "top_heavy_products" ||
      intent === "newest_products_by_sell_start" ||
      intent === "sample_products") &&
    next.limit == null
  ) {
    next.limit =
      intent === "top_cheapest_products"
        ? 20
        : intent === "sample_products"
          ? 15
          : 10;
  }
  if (intent === "cheapest_products_under_price") {
    if (next.maxPrice == null) next.maxPrice = 50;
    if (next.limit == null) next.limit = 25;
  }
  if (intent === "list_products" || intent === "list_products_by_weight") {
    if (next.limit == null) next.limit = 25;
    if (next.color != null) {
      const c = normalizeColor(next.color);
      if (c) next.color = c;
      else delete next.color;
    }
  }
  if (intent === "count_products_make_flag" && next.makeFlag == null) {
    next.makeFlag = true;
  }
  return next;
}
