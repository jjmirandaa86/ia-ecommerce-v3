export type {
  RefusalReason,
  ScopeGateReason,
  ScopeGateResult,
} from "@/query-agent/domain/scope/types";
export {
  SCOPE_MESSAGES,
  messageForRefusal,
} from "@/query-agent/domain/scope/messages";
export {
  detectQuestionScope,
  isWriteRequest,
  looksLikeEcommerceDomain,
} from "@/query-agent/domain/scope/detect";
