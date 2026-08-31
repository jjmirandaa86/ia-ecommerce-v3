/**
 * Semantic layer types — one def per intent (metric, grain, joins, time, filters).
 * SQL still lives in sql.ts; this file documents and validates the contract.
 */

export type SemanticGrain =
  | "scalar"
  | "product"
  | "category"
  | "subcategory"
  | "customer"
  | "contact"
  | "order"
  | "order_line"
  | "review"
  | "inventory_row"
  | "group_row";

export type SemanticDef = {
  /** Canonical intent name (must match intents.ts). */
  intent: string;
  /** Owning module folder / topic (product, customer, mixed, …). */
  entity: string;
  /** What the answer number/list measures (business wording). */
  metric: string;
  /** One result row represents… */
  grain: SemanticGrain;
  /** Tables this intent may FROM/JOIN (subset of ClientAcl allowlist). */
  joins: readonly string[];
  /** Preferred date/time column for period filters, if any. */
  timeField?: string;
  /** Filter keys the plan may carry (others should be ignored upstream). */
  filtersAllowed: readonly string[];
  /** Short traceability note for maintainers. */
  notes?: string;
};
