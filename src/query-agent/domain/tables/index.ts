/**
 * Intent catalog registry — one folder per client-table entity.
 * Add tables/customer/, tables/productinventory/, … and register below.
 * Order matters: more specific modules (review, sales detail/header) before product
 * so domain questions are not stolen by count_products.
 *
 * Semantic layer: each module exports `semantics` (see `<entity>/semantics.ts`).
 * `buildEcommerceQuery` asserts FROM/JOIN tables ⊆ SemanticDef.joins.
 */
import type {
  BuiltQuery,
  IntentModule,
  QueryPlan,
} from "@/query-agent/domain/intent-module";
import type { SemanticDef } from "@/query-agent/domain/semantics/types";
import {
  assertBuiltQueryMatchesSemantics,
  lookupSemanticDef,
  mergeSemanticMaps,
  SemanticValidationError,
} from "@/query-agent/domain/semantics/validate";
import { customerIntentModule } from "@/query-agent/domain/tables/customer";
import { mixedIntentModule } from "@/query-agent/domain/tables/mixed";
import { productIntentModule } from "@/query-agent/domain/tables/product";
import { reviewIntentModule } from "@/query-agent/domain/tables/review";
import { salesOrderDetailIntentModule } from "@/query-agent/domain/tables/salesorderdetail";
import { salesOrderHeaderIntentModule } from "@/query-agent/domain/tables/salesorderheader";

export const INTENT_MODULES: IntentModule[] = [
  mixedIntentModule,
  reviewIntentModule,
  salesOrderDetailIntentModule,
  salesOrderHeaderIntentModule,
  customerIntentModule,
  productIntentModule,
  // future: productInventoryIntentModule
];

/** Merged SemanticDef catalog (intent → meaning) for all registered modules. */
export const SEMANTIC_REGISTRY: Readonly<Record<string, SemanticDef>> =
  mergeSemanticMaps(INTENT_MODULES.map((m) => m.semantics));

export function getSemanticDef(intent: string): SemanticDef | null {
  return lookupSemanticDef(SEMANTIC_REGISTRY, intent);
}

export const ECOMMERCE_INTENTS = [
  ...INTENT_MODULES.flatMap((m) => m.intents),
  "no_match",
] as const;

export type EcommerceIntent = (typeof ECOMMERCE_INTENTS)[number];

const KNOWN = new Set<string>(ECOMMERCE_INTENTS);

export function isKnownIntent(name: string): name is EcommerceIntent {
  return KNOWN.has(name);
}

/** Topic group (`product`, `review`, …) for the intent catalog folder. */
export function entityForIntent(intent: string | null | undefined): string {
  const name = intent?.trim() || "";
  if (!name || name === "no_match") return "no_match";
  if (
    name === "write_blocked" ||
    name === "out_of_scope" ||
    name === "unmapped_read"
  ) {
    return "no_match";
  }
  for (const mod of INTENT_MODULES) {
    if ((mod.intents as readonly string[]).includes(name)) return mod.table;
  }
  return "unknown";
}

export function preferHeuristicIntent(intent: string): boolean {
  return INTENT_MODULES.some((m) =>
    (m.preferHeuristic as readonly string[] | undefined)?.includes(intent),
  );
}

export function heuristicClassify(text: string): QueryPlan | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  for (const mod of INTENT_MODULES) {
    const plan = mod.classifyHeuristic(q);
    if (plan) return plan;
  }
  return null;
}

export function parseClassificationJson(raw: string): QueryPlan | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(trimmed.slice(start, end + 1)) as {
      intent?: string;
      filters?: Record<string, unknown>;
    };
    if (!obj.intent || !isKnownIntent(obj.intent)) return null;
    let filters =
      obj.filters && typeof obj.filters === "object" ? { ...obj.filters } : {};
    for (const mod of INTENT_MODULES) {
      if (
        (mod.intents as readonly string[]).includes(obj.intent) &&
        mod.normalizeFilters
      ) {
        filters = mod.normalizeFilters(obj.intent, filters);
        break;
      }
    }
    return { intent: obj.intent, filters };
  } catch {
    return null;
  }
}

/**
 * Route a QueryPlan to the owning module's SQL builder, then assert the built
 * SQL only touches tables declared on that intent's SemanticDef.
 */
export function buildEcommerceQuery(plan: QueryPlan): BuiltQuery | null {
  if (plan.intent === "no_match") return null;
  for (const mod of INTENT_MODULES) {
    if (!(mod.intents as readonly string[]).includes(plan.intent)) continue;

    const def = getSemanticDef(plan.intent);
    if (!def) {
      throw new SemanticValidationError(
        `No SemanticDef for intent "${plan.intent}" (module ${mod.table}). Add it to ${mod.table}/semantics.ts.`,
      );
    }

    const built = mod.build(plan);
    if (built) {
      assertBuiltQueryMatchesSemantics(built, def);
    }
    return built;
  }
  return null;
}

export function formatEcommerceAnswer(
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string {
  if (plan.intent === "no_match") {
    return "I did not understand your request. Please rephrase it.";
  }
  for (const mod of INTENT_MODULES) {
    if (!(mod.intents as readonly string[]).includes(plan.intent)) continue;
    const text = mod.format(plan, rows);
    if (text != null) return text;
  }
  return "I did not understand your request. Please rephrase it.";
}

export function buildLlmSystemPrompt(): string {
  const sections = INTENT_MODULES.map((m) => m.llmPromptSection).join("\n\n");
  return `You classify ecommerce analytics questions into a fixed JSON intent.
Return ONLY one JSON object, no markdown.

Global intents:
- no_match — anything not covered below

Shape: {"intent":"<name>","filters":{...}}

${sections}

If unsure, use no_match.
`;
}

export type { QueryPlan, BuiltQuery } from "@/query-agent/domain/intent-module";
