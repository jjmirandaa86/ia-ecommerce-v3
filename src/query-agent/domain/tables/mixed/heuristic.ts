/**
 * heuristic.ts — mixed / multi-table phrase detection.
 * Must run before single-entity modules so compound questions are not stolen.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractCustomerNameContains,
  extractLastMonthsOptional,
  extractProductNameContains,
  extractTopN,
} from "@/query-agent/domain/tables/mixed/extract";

export function classifyMixedHeuristic(q: string): QueryPlan | null {
  const productNameContains = extractProductNameContains(q);
  const customerNameContains = extractCustomerNameContains(q);
  if (!productNameContains || !customerNameContains) return null;

  const aboutSalesOrOrders =
    /\b(sales?|orders?|sold|bought|purchased|line\s+items?)\b/.test(q);
  if (!aboutSalesOrOrders) return null;

  const filters: Record<string, unknown> = {
    productNameContains,
    customerNameContains,
    limit: extractTopN(q, 25),
  };
  const months = extractLastMonthsOptional(q);
  if (months != null) filters.lastMonths = months;

  return { intent: "products_sold_to_named_customers", filters };
}

export function normalizeMixedFilters(
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...filters };
  if (intent === "products_sold_to_named_customers" && next.limit == null) {
    next.limit = 25;
  }
  return next;
}
