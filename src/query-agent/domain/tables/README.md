# Intent modules by entity (table)

Each client entity is a folder under `src/query-agent/domain/tables/<entity>/`.
One table → one folder. Do not merge unrelated tables into a shared “sales” blob.

| Folder | Client tables | Status |
|---|---|---|
| `product/` | product, productsubcategory, productcategory | active |
| `review/` | productreview | active |
| `salesorderheader/` | salesorderheader | active (order-level) |
| `salesorderdetail/` | salesorderdetail (+ join product) | active (line items) |
| `mixed/` | cross-table joins (product×sales×customer, …) | active (seed intents) |
| `customer/` | customer (+ individual, contact fields; sales for spend) | active |
| `productinventory/` | productinventory | TODO |

## Files inside an entity folder (6 + index)

| File | Responsibility |
|---|---|
| `intents.ts` | Intent name list |
| `semantics.ts` | Semantic layer: metric, grain, joins, filters (traceability) |
| `heuristic.ts` | Phrase detection + filter defaults |
| `prompt.ts` | LLM classify section |
| `sql.ts` | SELECT templates only |
| `format.ts` | English answers from rows |
| `index.ts` | Wires `*IntentModule` (includes `semantics`) |

Optional: `extract.ts` for parse helpers owned by that entity.

Shared types/helpers: `src/query-agent/domain/semantics/` (`SemanticDef`, join assert on build).

## How to add a new intent

1. Add the name in `<entity>/intents.ts`
2. Add a `SemanticDef` in `<entity>/semantics.ts` (metric, grain, joins, filtersAllowed)
3. Heuristic (+ normalize) in `<entity>/heuristic.ts`
4. SQL in `<entity>/sql.ts` (FROM/JOIN tables must be ⊆ `semantics.joins`)
5. Answer copy in `<entity>/format.ts`
6. One line / example in `<entity>/prompt.ts`

Do **not** put product SQL in sales modules (or vice versa).
`salesorderheader` owns order totals/dates; `salesorderdetail` owns qty/product rankings.
