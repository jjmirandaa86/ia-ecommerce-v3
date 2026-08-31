import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/tables";
import {
  buildEcommerceQuery as buildFromRegistry,
  formatEcommerceAnswer as formatFromRegistry,
} from "@/query-agent/domain/tables";

export type { BuiltQuery };

/** Thin ACL facade — templates live in query-agent/domain/tables/<table>.ts */
export const buildEcommerceQuery = (plan: QueryPlan): BuiltQuery | null => {
  return buildFromRegistry(plan);
}

export const formatEcommerceAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string => {
  return formatFromRegistry(plan, rows);
}
