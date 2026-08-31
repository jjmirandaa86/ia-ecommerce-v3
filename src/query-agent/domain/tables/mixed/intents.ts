/**
 * intents.ts — cross-table / mixed join intents (2+ ecommerce tables).
 */
export const MIXED_INTENTS = [
  "products_sold_to_named_customers",
] as const;

export type MixedIntent = (typeof MIXED_INTENTS)[number];
