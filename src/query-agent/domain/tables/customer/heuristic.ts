/**
 * heuristic.ts — customer phrase detection.
 * Leave order-for-customer counts to salesorderheader.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractAccountNumber,
  extractCategory,
  extractCustomerId,
  extractCustomerType,
  extractEmail,
  extractFirstName,
  extractLastMonths,
  extractLastMonthsOptional,
  extractLastName,
  extractMaxSpend,
  extractMinOrders,
  extractMinSpend,
  extractNameContains,
  extractNamedPerson,
  extractPhone,
  extractTerritoryId,
  extractTopN,
  extractYear,
} from "@/query-agent/domain/tables/customer/extract";

export const classifyCustomerHeuristic = (q: string): QueryPlan | null => {
  const aboutCustomers = /\b(customers?|clientes?)\b/.test(q);
  const aboutAccount = /\baccount\s*(number)?\b/.test(q);
  const aboutCustomerSpendDims =
    /\baverage\s+spend\b/.test(q) && /\bby\s+territory\b/.test(q);
  if (
    !aboutCustomers &&
    !aboutAccount &&
    !/\bstore\s+customers?\b/.test(q) &&
    !aboutCustomerSpendDims
  ) {
    return null;
  }

  // Do not steal order-centric questions owned by salesorderheader.
  if (
    /\b(how many|count)\s+orders?\b/.test(q) ||
    /\borders?\s+(does|for)\s+customer\b/.test(q) ||
    /\bshow\s+orders?\s+for\s+customer\b/.test(q)
  ) {
    return null;
  }

  // Out of scope for MVP customer module (product fixture expects no_match).
  if (/\bbought\s+product\b/.test(q) || /\bcustomers?\s+bought\b/.test(q)) {
    return null;
  }

  // Cross-domain: products / reviews / stock (unless customer spend/category)
  if (
    /\b(products?|reviews?|ratings?|stock|inventory)\b/.test(q) &&
    !/\b(spend|sales|bought|purchase|category)\b/.test(q)
  ) {
    return null;
  }

  const asksCount =
    /\b(how many|count|number of|total)\b/.test(q) ||
    /\b(cu[aá]ntos?|cantidad)\b/.test(q);
  const asksAvg = /\b(average|avg|mean)\b/.test(q);

  const customerId = extractCustomerId(q);
  const account = extractAccountNumber(q);
  const type = extractCustomerType(q);
  const territoryId = extractTerritoryId(q);
  const category = extractCategory(q);
  const limit = extractTopN(q, 10);

  if (/\bcompare\b/.test(q) && /\b(type|store|individual)\b/.test(q) && /\bspend|sales\b/.test(q)) {
    return { intent: "compare_customer_types_spend", filters: {} };
  }

  if (customerId != null && (/\bspend|sales\s+value|total\s+due|lifetime\b/.test(q))) {
    return { intent: "customer_spend_for_id", filters: { customerId } };
  }
  if (customerId != null && (/\border\s+count|how many orders|number of orders\b/.test(q))) {
    // header owns; but if we got here...
    return null;
  }
  if (customerId != null && (/\bshow\b/.test(q) || /\bwhat\s+is\b/.test(q) || /\blook\s+up\b/.test(q))) {
    return { intent: "customer_by_id", filters: { customerId } };
  }
  if (customerId != null && asksCount === false && !/\btop\b|\blowest\b/.test(q)) {
    return { intent: "customer_by_id", filters: { customerId } };
  }

  // Lookups after rankings (avoid "account numbers by sales" false positives)
  if (account && !/\btop\b/.test(q) && !/\bby\s+sales\b/.test(q)) {
    return { intent: "customer_by_account", filters: { accountNumber: account } };
  }

  // Contact filters via individual → contact (name / email / phone)
  {
    const nameContains = extractNameContains(q);
    const firstName = extractFirstName(q);
    const lastName = extractLastName(q);
    const named = !firstName && !lastName && !nameContains ? extractNamedPerson(q) : null;
    const email = extractEmail(q);
    const phone = extractPhone(q);
    const filters: Record<string, unknown> = {};
    if (nameContains) filters.nameContains = nameContains;
    if (firstName) filters.firstName = firstName;
    else if (named?.firstName) filters.firstName = named.firstName;
    if (lastName) filters.lastName = lastName;
    else if (named?.lastName) filters.lastName = named.lastName;
    if (email) filters.email = email;
    if (phone) filters.phone = phone;

    const hasContactFilter =
      filters.nameContains != null ||
      filters.firstName != null ||
      filters.lastName != null ||
      filters.email != null ||
      filters.phone != null;

    if (hasContactFilter) {
      const wantsOrdersOrSales =
        /\borders?\b/.test(q) ||
        (/\bsales\b/.test(q) &&
          (/\blast\b|\bpast\b|\byear\b|\bmonths?\b/.test(q) || /\bshow\b/.test(q)));
      if (wantsOrdersOrSales && !asksCount) {
        const period = extractLastMonthsOptional(q);
        const orderFilters: Record<string, unknown> = {
          ...filters,
          limit: extractTopN(q, 25),
        };
        if (period != null) orderFilters.lastMonths = period;
        return { intent: "orders_for_customers_by_name", filters: orderFilters };
      }
      if (asksCount) {
        return { intent: "count_customers_by_name", filters };
      }
      filters.limit = extractTopN(q, 25);
      return { intent: "customers_by_name", filters };
    }
  }

  if (/\bvariance\b/.test(q) && /\bspend|sales\b/.test(q)) {
    return { intent: "variance_customer_spend", filters: {} };
  }
  if (/\bmedian\b/.test(q) && /\bspend|sales\b/.test(q) && aboutCustomers) {
    return { intent: "median_customer_spend", filters: {} };
  }

  if (
    (/\btop\b/.test(q) || /\bmost\b/.test(q) || /\bhighest\b/.test(q)) &&
    (aboutCustomers || aboutAccount) &&
    (/\bsales\b/.test(q) || /\bspend/.test(q) || /\brevenue\b/.test(q))
  ) {
    const filters: Record<string, unknown> = { limit };
    if (/\baccount\s+numbers?\b/.test(q)) {
      return { intent: "top_account_numbers_by_sales", filters };
    }
    if (!aboutCustomers) {
      // account-only phrasing without "customers"
      return { intent: "top_account_numbers_by_sales", filters };
    }
    if (category) {
      filters.category = category;
      return { intent: "customers_by_category_spend", filters };
    }
    if (/\blast\s+\d+\s+months?\b/.test(q) || /\bpast\s+\d+\s+months?\b/.test(q)) {
      filters.lastMonths = extractLastMonths(q, 12);
      return { intent: "top_customers_by_sales_period", filters };
    }
    if (type) {
      filters.customerType = type;
      return { intent: "top_customers_by_sales_type", filters };
    }
    if (territoryId != null) {
      filters.territoryId = territoryId;
      return { intent: "top_customers_by_sales_territory", filters };
    }
    return { intent: "top_customers_by_sales", filters };
  }

  if (
    (/\blowest\b/.test(q) || /\bleast\b/.test(q) || /\bbottom\b/.test(q)) &&
    aboutCustomers &&
    (/\bsales\b/.test(q) || /\bspend/.test(q))
  ) {
    return { intent: "lowest_customers_by_sales", filters: { limit } };
  }

  if (
    (/\btop\b/.test(q) || /\bmost\b/.test(q)) &&
    aboutCustomers &&
    /\border\s+count|orders?\b/.test(q) &&
    !/\bsales\b|\bspend\b/.test(q)
  ) {
    return { intent: "top_customers_by_order_count", filters: { limit } };
  }
  if (
    (/\blowest\b/.test(q) || /\bfewest\b/.test(q) || (/\bleast\b/.test(q) && !/\bat\s+least\b/.test(q))) &&
    aboutCustomers &&
    /\border\s+count|orders?\b/.test(q)
  ) {
    return { intent: "lowest_customers_by_order_count", filters: { limit } };
  }

  if (/\bspend\s+the\s+most\b/.test(q) && aboutCustomers && category) {
    return {
      intent: "customers_by_category_spend",
      filters: { category, limit },
    };
  }
  if (/\bin\s+category\b/.test(q) && aboutCustomers && (/\bspend\b|\bsales\b|\bbought\b/.test(q))) {
    if (category) {
      return {
        intent: "customers_by_category_spend",
        filters: { category, limit },
      };
    }
  }

  if (asksAvg && aboutCustomers && /\b(orders?\s+per\s+customer)\b/.test(q)) {
    return { intent: "avg_orders_per_customer", filters: {} };
  }
  if (asksAvg && aboutCustomers && /\bspend\b/.test(q) && /\bby\s+(customer\s+)?type\b/.test(q)) {
    return { intent: "avg_spend_by_type", filters: {} };
  }
  if (
    asksAvg &&
    /\bspend\b/.test(q) &&
    /\bby\s+territory\b/.test(q) &&
    (aboutCustomers || /\bspend\b/.test(q))
  ) {
    return { intent: "avg_spend_by_territory", filters: {} };
  }
  if (asksAvg && aboutCustomers && /\bspend|sales\b/.test(q)) {
    return { intent: "avg_customer_spend", filters: {} };
  }

  if (
    (/\bsum\b/.test(q) ||
      /\btotal\s+spend\b/.test(q) ||
      /\btotal\s+customer\s+(spend|sales)\b/.test(q) ||
      /\bsum\s+of\s+all\s+customer\s+sales\b/.test(q)) &&
    aboutCustomers
  ) {
    return { intent: "sum_customer_spend", filters: {} };
  }
  if (/\bmaximum\s+customer\s+spend\b|\bmax\s+customer\s+spend\b/.test(q)) {
    return { intent: "max_customer_spend", filters: {} };
  }
  if (/\bminimum\s+customer\s+spend\b|\bmin\s+customer\s+spend\b/.test(q)) {
    return { intent: "min_customer_spend", filters: {} };
  }

  const minSpend = extractMinSpend(q);
  if (aboutCustomers && minSpend != null && /\bspend|sales\b/.test(q) && !/\btop\b/.test(q)) {
    return {
      intent: "customers_spend_over",
      filters: { minSpend, limit: extractTopN(q, 25) },
    };
  }
  const maxSpend = extractMaxSpend(q);
  if (aboutCustomers && maxSpend != null && /\bspend|sales\b/.test(q)) {
    return {
      intent: "customers_spend_under",
      filters: { maxSpend, limit: extractTopN(q, 25) },
    };
  }

  const minOrders = extractMinOrders(q);
  if (aboutCustomers && minOrders != null) {
    return {
      intent: "customers_with_min_orders",
      filters: { minOrders, limit: extractTopN(q, 25) },
    };
  }

  if (
    /\bpercent|pct|%\b/.test(q) &&
    aboutCustomers &&
    (/\bwith\s+orders?\b/.test(q) || /\bhave\s+orders?\b/.test(q))
  ) {
    return { intent: "pct_customers_with_orders", filters: {} };
  }
  if (/\bpercent|pct|%\b/.test(q) && aboutCustomers && /\bby\s+type\b/.test(q)) {
    return { intent: "pct_customers_by_type", filters: {} };
  }

  if (asksCount && aboutCustomers && /\bwithout\s+orders?\b|\bno\s+orders?\b|\bnever\s+ordered\b/.test(q)) {
    return { intent: "count_customers_without_orders", filters: {} };
  }
  if (
    asksCount &&
    aboutCustomers &&
    (/\bwith\s+orders?\b/.test(q) ||
      /\bthat\s+have\s+orders?\b/.test(q) ||
      /\bhave\s+orders?\b/.test(q))
  ) {
    return { intent: "count_customers_with_orders", filters: {} };
  }

  if (/\blist\b/.test(q) && aboutCustomers && /\bwithout\s+orders?\b/.test(q)) {
    return {
      intent: "list_customers_without_orders",
      filters: { limit: extractTopN(q, 25) },
    };
  }
  if (/\blist\b/.test(q) && aboutCustomers && /\bwith\s+orders?\b/.test(q)) {
    return {
      intent: "list_customers_with_orders",
      filters: { limit: extractTopN(q, 25) },
    };
  }

  if (asksCount && /\bstore\s+customers?\b/.test(q)) {
    return { intent: "count_store_customers", filters: {} };
  }
  if (asksCount && /\bindividual\s+customers?\b/.test(q)) {
    return { intent: "count_individual_customers", filters: {} };
  }

  if (asksCount && aboutCustomers && /\bby\s+territory\b/.test(q) && /\btype\b/.test(q)) {
    return { intent: "customer_count_by_territory_type", filters: {} };
  }
  if (asksCount && aboutCustomers && territoryId != null) {
    return { intent: "count_customers_by_territory", filters: { territoryId } };
  }
  if (asksCount && aboutCustomers && type) {
    return { intent: "count_customers_by_type", filters: { customerType: type } };
  }
  if (
    (/\bby\s+type\b/.test(q) || /\bper\s+type\b/.test(q)) &&
    aboutCustomers &&
    (asksCount || /\bgrouped\b/.test(q) || /\bbreakdown\b/.test(q))
  ) {
    return { intent: "customers_by_type", filters: {} };
  }
  if (
    (/\bby\s+territory\b/.test(q) || /\bper\s+territory\b/.test(q)) &&
    aboutCustomers &&
    (asksCount || /\bgrouped\b/.test(q) || /\bbreakdown\b/.test(q) || /^customers?\s+by\s+territory\b/.test(q))
  ) {
    return { intent: "customers_by_territory", filters: {} };
  }

  if (/\brandom\s+sample\b/.test(q) && /\bstore\b/.test(q) && aboutCustomers) {
    return {
      intent: "random_sample_store_customers",
      filters: { limit: extractTopN(q, 10) },
    };
  }
  if (/\brandom\s+sample\b/.test(q) && aboutCustomers) {
    return { intent: "sample_customers", filters: { limit: extractTopN(q, 10) } };
  }

  if (/\blatest\b/.test(q) && aboutCustomers) {
    return { intent: "latest_customers", filters: { limit: extractTopN(q, 10) } };
  }
  if (/\boldest\b/.test(q) && aboutCustomers) {
    return { intent: "oldest_customers", filters: { limit: extractTopN(q, 10) } };
  }

  const year = extractYear(q);
  if (/\bmodified\s+after\b/.test(q) && year != null && aboutCustomers) {
    return { intent: "customers_modified_after", filters: { year } };
  }

  if (/\blist\b/.test(q) && aboutCustomers) {
    const filters: Record<string, unknown> = { limit: extractTopN(q, 25) };
    if (type) filters.customerType = type;
    if (territoryId != null) filters.territoryId = territoryId;
    return { intent: "list_customers", filters };
  }

  if (asksCount && aboutCustomers) {
    return { intent: "count_customers", filters: {} };
  }

  // Soft paraphrases
  if (/\bhow many customers do i have\b/.test(q) || /\btotal customers\b/.test(q)) {
    return { intent: "count_customers", filters: {} };
  }

  return null;
}

export const normalizeCustomerFilters = (
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...filters };
  const withLimit = [
    "list_customers",
    "sample_customers",
    "latest_customers",
    "oldest_customers",
    "list_customers_with_orders",
    "list_customers_without_orders",
    "top_customers_by_sales",
    "lowest_customers_by_sales",
    "top_customers_by_order_count",
    "lowest_customers_by_order_count",
    "customers_by_category_spend",
    "customers_spend_over",
    "customers_spend_under",
    "customers_with_min_orders",
    "top_customers_by_sales_period",
    "top_customers_by_sales_type",
    "top_customers_by_sales_territory",
    "random_sample_store_customers",
    "top_account_numbers_by_sales",
    "customers_by_name",
    "orders_for_customers_by_name",
  ];
  if (withLimit.includes(intent) && next.limit == null) {
    next.limit = intent.startsWith("list_") || intent.startsWith("customers_spend")
      ? 25
      : 10;
  }
  if (next.customerType != null) {
    const t = String(next.customerType).toUpperCase();
    next.customerType = t === "S" || t === "I" ? t : undefined;
    if (next.customerType == null) delete next.customerType;
  }
  return next;
}
