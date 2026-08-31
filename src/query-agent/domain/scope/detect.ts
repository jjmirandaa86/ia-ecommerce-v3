import type { ScopeGateResult } from "@/query-agent/domain/scope/types";

/**
 * Detect write / mutation intent (create, update, delete, …).
 * Read-only analytics must not execute these.
 */
const WRITE_PATTERN =
  /\b(create|insert|update|delete|remove|drop|alter|modify|edit|upsert|truncate|rename|overwrite|replace)\b|\b(add|make)\s+(a\s+)?new\b|\b(set|change|mark)\s+(the\s+)?(price|status|name|email|password|stock|quantity|qty)\b|\b(please\s+)?(delete|remove|update|create)\b/i;

/**
 * Cues that the question touches our MVP ecommerce tables / metrics.
 * (product, review, customer/contact, sales order header/detail, inventory.)
 */
const DOMAIN_PATTERN =
  /\b(products?|skus?|catalog|list\s*price|prices?|categor(y|ies)|subcategor(y|ies)|colou?rs?|finished\s+goods?|make\s+flag|reviews?|ratings?|reviewers?|customers?|contacts?|account\s+numbers?|territor(y|ies)|stores?|individuals?|orders?|sales?|sold|revenue|line\s+totals?|freight|tax|subtotal|ship\s+dates?|order\s+dates?|qty|quantit(y|ies)|inventory|stock|safety\s+stock|bikes?|clothing|components?|accessor(y|ies)|salesperson|special\s+offers?)\b/i;

export function isWriteRequest(text: string): boolean {
  const q = text.trim();
  if (!q) return false;
  return WRITE_PATTERN.test(q);
}

export function looksLikeEcommerceDomain(text: string): boolean {
  const q = text.trim();
  if (!q) return false;
  return DOMAIN_PATTERN.test(q);
}

/**
 * Gate before intent classify.
 * - write_blocked → refuse with read-only copy (no classify)
 * - out_of_scope → unrelated to MVP tables (no classify)
 * - in_scope → heuristic / LLM classify (may still become unmapped_read)
 */
export function detectQuestionScope(text: string): ScopeGateResult {
  if (isWriteRequest(text)) {
    return { reason: "write_blocked" };
  }
  if (looksLikeEcommerceDomain(text)) {
    return { reason: "in_scope" };
  }
  return { reason: "out_of_scope" };
}
