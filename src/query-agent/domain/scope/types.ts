/**
 * Scope / refusal reasons for questions that do not become a matched SELECT.
 * Fixed copy lives in messages.ts — LLM does not invent the reply.
 */
export type ScopeGateReason = "write_blocked" | "out_of_scope" | "in_scope";

/** After classify returns no_match while the question looked in-domain. */
export type RefusalReason =
  | "write_blocked"
  | "out_of_scope"
  | "unmapped_read";

export type ScopeGateResult = {
  reason: ScopeGateReason;
};
