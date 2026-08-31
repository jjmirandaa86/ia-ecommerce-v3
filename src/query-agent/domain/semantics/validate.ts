/**
 * Semantic registry helpers — lookup + soft validation for QueryPlan / BuiltQuery.
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import type { SemanticDef } from "@/query-agent/domain/semantics/types";

export class SemanticValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SemanticValidationError";
  }
}

/** Merge per-module maps into one intent → def registry. */
export function mergeSemanticMaps(
  maps: ReadonlyArray<Readonly<Record<string, SemanticDef>>>,
): Readonly<Record<string, SemanticDef>> {
  const out: Record<string, SemanticDef> = {};
  for (const map of maps) {
    for (const [intent, def] of Object.entries(map)) {
      if (out[intent]) {
        throw new SemanticValidationError(
          `Duplicate SemanticDef for intent "${intent}"`,
        );
      }
      if (def.intent !== intent) {
        throw new SemanticValidationError(
          `SemanticDef key "${intent}" does not match def.intent "${def.intent}"`,
        );
      }
      out[intent] = def;
    }
  }
  return out;
}

export function lookupSemanticDef(
  registry: Readonly<Record<string, SemanticDef>>,
  intent: string,
): SemanticDef | null {
  return registry[intent] ?? null;
}

/**
 * Ensure every filter key is declared on the SemanticDef.
 * Unknown keys are dropped (LLM sometimes invents extras); required path stays stable.
 */
export function sanitizePlanFilters(
  plan: QueryPlan,
  def: SemanticDef,
): QueryPlan {
  const allowed = new Set(def.filtersAllowed);
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(plan.filters ?? {})) {
    if (allowed.has(key)) next[key] = value;
  }
  return { intent: plan.intent, filters: next };
}

/** Extract table names from FROM / JOIN clauses (same spirit as ClientAcl). */
export function tablesReferencedInSql(sql: string): string[] {
  const normalized = sql.replace(/\s+/g, " ").trim();
  const fromMatches = [
    ...normalized.matchAll(/\b(?:from|join)\s+([`"]?)([a-zA-Z0-9_]+)\1/gi),
  ];
  const tables: string[] = [];
  for (const m of fromMatches) {
    const table = m[2]?.toLowerCase();
    if (table) tables.push(table);
  }
  return tables;
}

/**
 * Assert every FROM/JOIN table is in the intent's semantic joins list.
 * Subqueries referencing allowlisted tables must still be listed on the def.
 */
export function assertBuiltQueryMatchesSemantics(
  built: BuiltQuery,
  def: SemanticDef,
): void {
  const allowed = new Set(def.joins.map((t) => t.toLowerCase()));
  for (const table of tablesReferencedInSql(built.sql)) {
    if (!allowed.has(table)) {
      throw new SemanticValidationError(
        `Intent "${def.intent}" SQL references table "${table}" not declared in SemanticDef.joins`,
      );
    }
  }
}
