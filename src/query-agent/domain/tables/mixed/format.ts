/**
 * format.ts — mixed join natural-language answers.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";

function asNumber(raw: unknown): number | null {
  if (raw == null) return null;
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function str(r: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

export function formatMixedAnswer(
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null {
  const f = plan.filters;

  switch (plan.intent) {
    case "products_sold_to_named_customers": {
      const prod = String(f.productNameContains ?? "product");
      const cust = String(f.customerNameContains ?? "customer");
      const months = asNumber(f.lastMonths);
      const period =
        months != null
          ? ` in the last ${months} month${months === 1 ? "" : "s"}`
          : "";
      if (!rows.length) {
        return `No sales were found for products like ${prod} bought by customers named like ${cust}${period}.`;
      }
      const lines = rows.map((r) => {
        const oid = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        const when = String(r.orderDate ?? r.orderdate ?? "").slice(0, 10);
        const pname = str(r, "productName", "productname") || "Unknown product";
        const cname = str(r, "customerName", "customername");
        const cid = asNumber(r.customerId ?? r.customerid) ?? 0;
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        const line = asNumber(r.lineTotal ?? r.linetotal) ?? 0;
        const email = str(r, "emailAddress", "emailaddress");
        const who = cname ? `${cname} (#${cid})` : `customer #${cid}`;
        const contact = email ? ` — ${email}` : "";
        return `• Order #${oid} ${when}: ${pname} ×${qty} → ${who}${contact} — ${money(line)}`;
      });
      return `Products like ${prod} sold to customers like ${cust}${period}:\n${lines.join("\n")}`;
    }
    default:
      return null;
  }
}
