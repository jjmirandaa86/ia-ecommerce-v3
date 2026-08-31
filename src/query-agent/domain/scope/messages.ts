import type { RefusalReason } from "@/query-agent/domain/scope/types";

/**
 * Professional English replies for out-of-catalog / read-only refusals.
 * Keep deterministic — do not generate these with the LLM.
 */
export const SCOPE_MESSAGES: Readonly<Record<RefusalReason, string>> = {
  write_blocked:
    "This assistant is currently read-only. I can answer questions about your ecommerce catalog and sales data, but create, update, or delete operations are not available yet.",

  out_of_scope:
    "That request is outside the ecommerce analytics catalog we support today (products, reviews, customers, and orders). Please ask about those areas, or pick one of the suggested examples.",

  unmapped_read:
    "That looks related to our ecommerce data, but this specific question is not mapped in the intent catalog yet. Try rephrasing, or use one of the suggested examples below.",
};

export function messageForRefusal(reason: RefusalReason): string {
  return SCOPE_MESSAGES[reason];
}
