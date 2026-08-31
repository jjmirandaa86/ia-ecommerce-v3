/**
 * format.ts — customer natural-language answers.
 * Prefer contact fields (individual→contact) when present; else AccountNumber.
 * Contact: name parts, email, phone, emailPromotion (never passwords).
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";

const asNumber = (raw: unknown): number | null => {
  if (raw == null) return null;
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

const money = (n: number): string => {
  return `$${n.toFixed(2)}`;
}

const typeLabel = (t: unknown): string => {
  const s = String(t ?? "").toUpperCase();
  if (s === "S") return "Store";
  if (s === "I") return "Individual";
  return s || "Unknown";
}

const str = (r: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

const contactExtras = (r: Record<string, unknown>): string => {
  const bits: string[] = [];
  const email = str(r, "emailAddress", "emailaddress");
  const phone = str(r, "phone");
  if (email) bits.push(email);
  if (phone) bits.push(phone);
  return bits.length ? ` — ${bits.join(" · ")}` : "";
}

const customerLabel = (r: Record<string, unknown>): string => {
  const id = asNumber(r.customerId ?? r.customerid) ?? 0;
  const name = str(r, "customerName", "customername");
  const acct = str(r, "accountNumber", "accountnumber");
  const head = name
    ? `#${id} ${name}${acct ? ` (${acct})` : ""}`
    : `#${id}${acct ? ` ${acct}` : ""}`;
  return `${head}${contactExtras(r)}`;
}

const formatContactDetail = (row: Record<string, unknown>): string => {
  const parts: string[] = [];
  const title = str(row, "title");
  const first = str(row, "firstName", "firstname");
  const middle = str(row, "middleName", "middlename");
  const last = str(row, "lastName", "lastname");
  const suffix = str(row, "suffix");
  const nameBits = [title, first, middle, last, suffix].filter(Boolean);
  if (nameBits.length) parts.push(`Name: ${nameBits.join(" ")}`);
  const email = str(row, "emailAddress", "emailaddress");
  if (email) parts.push(`Email: ${email}`);
  const phone = str(row, "phone");
  if (phone) parts.push(`Phone: ${phone}`);
  const promo = asNumber(row.emailPromotion ?? row.emailpromotion);
  if (promo != null) parts.push(`Email promotion: ${promo}`);
  const contactId = asNumber(row.contactId ?? row.contactid);
  if (contactId != null) parts.push(`Contact ID: ${contactId}`);
  return parts.length ? `\n${parts.map((p) => `  ${p}`).join("\n")}` : "";
}

const nameFilterScope = (f: Record<string, unknown>): string => {
  const bits: string[] = [];
  if (f.nameContains != null) bits.push(`name like ${String(f.nameContains)}`);
  if (f.firstName != null) bits.push(`first name ${String(f.firstName)}`);
  if (f.lastName != null) bits.push(`last name ${String(f.lastName)}`);
  if (f.email != null) bits.push(`email ${String(f.email)}`);
  if (f.phone != null) bits.push(`phone ${String(f.phone)}`);
  return bits.length ? bits.join(" and ") : "that contact filter";
}

const bullets = (
  rows: Record<string, unknown>[],
  map: (r: Record<string, unknown>) => string,
): string => {
  return rows.map((r) => `• ${map(r)}`).join("\n");
}

export const formatCustomerAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null => {
  const f = plan.filters;

  switch (plan.intent) {
    case "count_customers":
    case "count_store_customers":
    case "count_individual_customers":
    case "count_customers_by_type":
    case "count_customers_by_territory":
    case "count_customers_with_orders":
    case "count_customers_without_orders":
    case "count_customers_by_name": {
      const count = asNumber(rows[0]?.customerCount ?? rows[0]?.customercount) ?? 0;
      if (plan.intent === "count_store_customers") {
        return `There ${count === 1 ? "is" : "are"} ${count} store customer${count === 1 ? "" : "s"}.`;
      }
      if (plan.intent === "count_individual_customers") {
        return `There ${count === 1 ? "is" : "are"} ${count} individual customer${count === 1 ? "" : "s"}.`;
      }
      if (plan.intent === "count_customers_by_type") {
        return `There ${count === 1 ? "is" : "are"} ${count} customer${count === 1 ? "" : "s"} of type ${typeLabel(f.customerType)}.`;
      }
      if (plan.intent === "count_customers_by_territory") {
        return `There ${count === 1 ? "is" : "are"} ${count} customer${count === 1 ? "" : "s"} in territory ${f.territoryId}.`;
      }
      if (plan.intent === "count_customers_with_orders") {
        return `${count} customer${count === 1 ? "" : "s"} have placed orders.`;
      }
      if (plan.intent === "count_customers_without_orders") {
        return `${count} customer${count === 1 ? "" : "s"} have no orders.`;
      }
      if (plan.intent === "count_customers_by_name") {
        return `There ${count === 1 ? "is" : "are"} ${count} customer${count === 1 ? "" : "s"} with ${nameFilterScope(f)}.`;
      }
      return `There ${count === 1 ? "is" : "are"} ${count} customer${count === 1 ? "" : "s"}.`;
    }
    case "customers_by_type":
    case "pct_customers_by_type": {
      if (!rows.length) return "No customer type breakdown was found.";
      if (plan.intent === "pct_customers_by_type") {
        return `Customers by type (%):\n${bullets(rows, (r) => {
          const pct = asNumber(r.pctCustomers ?? r.pctcustomers) ?? 0;
          return `${typeLabel(r.customerType ?? r.customertype)}: ${pct.toFixed(2)}%`;
        })}`;
      }
      return `Customers by type:\n${bullets(rows, (r) => {
        const n = asNumber(r.customerCount ?? r.customercount) ?? 0;
        return `${typeLabel(r.customerType ?? r.customertype)}: ${n}`;
      })}`;
    }
    case "customers_by_territory":
    case "avg_spend_by_territory": {
      if (!rows.length) return "No territory data was found.";
      if (plan.intent === "avg_spend_by_territory") {
        return `Average spend by territory:\n${bullets(rows, (r) => {
          const tid = asNumber(r.territoryId ?? r.territoryid) ?? 0;
          const avg = asNumber(r.avgSpend ?? r.avgspend);
          return `Territory ${tid}: ${avg == null ? "n/a" : money(avg)}`;
        })}`;
      }
      return `Customers by territory:\n${bullets(rows, (r) => {
        const tid = asNumber(r.territoryId ?? r.territoryid) ?? 0;
        const n = asNumber(r.customerCount ?? r.customercount) ?? 0;
        return `Territory ${tid}: ${n}`;
      })}`;
    }
    case "customer_count_by_territory_type": {
      if (!rows.length) return "No territory/type breakdown was found.";
      return `Customers by territory and type:\n${bullets(rows, (r) => {
        const tid = asNumber(r.territoryId ?? r.territoryid) ?? 0;
        const n = asNumber(r.customerCount ?? r.customercount) ?? 0;
        return `Territory ${tid} / ${typeLabel(r.customerType ?? r.customertype)}: ${n}`;
      })}`;
    }
    case "customer_by_id":
    case "customer_by_account": {
      const row = rows[0];
      if (!row) return "That customer was not found.";
      const id = asNumber(row.customerId ?? row.customerid) ?? 0;
      const name = str(row, "customerName", "customername");
      const acct = str(row, "accountNumber", "accountnumber");
      const typ = typeLabel(row.customerType ?? row.customertype);
      const tid = asNumber(row.territoryId ?? row.territoryid);
      const who = name ? `${name} (account ${acct})` : `account ${acct}`;
      return `Customer #${id} (${who}) is type ${typ}${tid != null ? ` in territory ${tid}` : ""}.${formatContactDetail(row)}`;
    }
    case "list_customers":
    case "sample_customers":
    case "random_sample_store_customers":
    case "latest_customers":
    case "oldest_customers":
    case "list_customers_with_orders":
    case "list_customers_without_orders":
    case "customers_modified_after":
    case "customers_by_name": {
      if (!rows.length) {
        if (plan.intent === "customers_by_name") {
          return `No customers matched with ${nameFilterScope(f)}.`;
        }
        return "No customers matched.";
      }
      const label =
        plan.intent === "latest_customers"
          ? "Latest customers"
          : plan.intent === "oldest_customers"
            ? "Oldest customers"
            : plan.intent === "sample_customers" || plan.intent === "random_sample_store_customers"
              ? "Sample customers"
              : plan.intent === "customers_by_name"
                ? "Customers by contact"
                : "Customers";
      return `${label}:\n${bullets(rows, (r) => customerLabel(r))}`;
    }
    case "orders_for_customers_by_name": {
      if (!rows.length) {
        const months = asNumber(f.lastMonths);
        const period =
          months != null ? ` in the last ${months} month${months === 1 ? "" : "s"}` : "";
        return `No orders were found for customers with ${nameFilterScope(f)}${period}.`;
      }
      const months = asNumber(f.lastMonths);
      const period =
        months != null ? ` (last ${months} month${months === 1 ? "" : "s"})` : "";
      return `Orders for customers with ${nameFilterScope(f)}${period}:\n${bullets(rows, (r) => {
        const oid = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        const due = asNumber(r.totalDue ?? r.totaldue) ?? 0;
        const when = String(r.orderDate ?? r.orderdate ?? "").slice(0, 10);
        return `Order #${oid} ${when} — ${customerLabel(r)} — ${money(due)}`;
      })}`;
    }
    case "pct_customers_with_orders": {
      const pct = asNumber(rows[0]?.pctWithOrders ?? rows[0]?.pctwithorders);
      if (pct == null) return "No customer order coverage was found.";
      return `${pct.toFixed(2)}% of customers have orders.`;
    }
    case "top_customers_by_sales":
    case "lowest_customers_by_sales":
    case "top_account_numbers_by_sales":
    case "top_customers_by_sales_period":
    case "top_customers_by_sales_type":
    case "top_customers_by_sales_territory":
    case "customers_by_category_spend":
    case "customers_spend_over":
    case "customers_spend_under": {
      if (!rows.length) return "No customer sales ranking was found.";
      const label =
        plan.intent === "lowest_customers_by_sales"
          ? "Lowest customers by sales"
          : plan.intent === "customers_by_category_spend"
            ? `Top customers by spend in ${f.category ?? "category"}`
            : "Top customers by sales";
      return `${label}:\n${bullets(rows, (r) => {
        const sales = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        return `${customerLabel(r)}: ${money(sales)}`;
      })}`;
    }
    case "top_customers_by_order_count":
    case "lowest_customers_by_order_count":
    case "customers_with_min_orders": {
      if (!rows.length) return "No customer order-count ranking was found.";
      return `Customers by order count:\n${bullets(rows, (r) => {
        const n = asNumber(r.orderCount ?? r.ordercount) ?? 0;
        return `${customerLabel(r)}: ${n} order${n === 1 ? "" : "s"}`;
      })}`;
    }
    case "avg_customer_spend": {
      const n = asNumber(rows[0]?.avgSpend ?? rows[0]?.avgspend);
      if (n == null) return "No average customer spend was found.";
      return `Average customer spend is ${money(n)}.`;
    }
    case "median_customer_spend": {
      const n = asNumber(rows[0]?.medianSpend ?? rows[0]?.medianspend);
      if (n == null) return "No median customer spend was found.";
      return `Median customer spend is ${money(n)}.`;
    }
    case "sum_customer_spend": {
      const n = asNumber(rows[0]?.sumSpend ?? rows[0]?.sumspend) ?? 0;
      return `Total customer sales value is ${money(n)}.`;
    }
    case "max_customer_spend": {
      const n = asNumber(rows[0]?.maxSpend ?? rows[0]?.maxspend);
      if (n == null) return "No maximum customer spend was found.";
      return `Maximum customer spend is ${money(n)}.`;
    }
    case "min_customer_spend": {
      const n = asNumber(rows[0]?.minSpend ?? rows[0]?.minspend);
      if (n == null) return "No minimum customer spend was found.";
      return `Minimum customer spend is ${money(n)}.`;
    }
    case "variance_customer_spend": {
      const n = asNumber(rows[0]?.varianceSpend ?? rows[0]?.variancespend);
      if (n == null) return "No spend variance was found.";
      return `Variance of customer spend is ${n.toFixed(2)}.`;
    }
    case "avg_orders_per_customer": {
      const n = asNumber(rows[0]?.avgOrders ?? rows[0]?.avgorders);
      if (n == null) return "No average orders per customer was found.";
      return `On average there are ${n.toFixed(2)} orders per customer.`;
    }
    case "customer_spend_for_id": {
      const sales = asNumber(rows[0]?.salesValue ?? rows[0]?.salesvalue) ?? 0;
      const orders = asNumber(rows[0]?.orderCount ?? rows[0]?.ordercount) ?? 0;
      return `Customer ${f.customerId} has spent ${money(sales)} across ${orders} order${orders === 1 ? "" : "s"}.`;
    }
    case "customer_order_count_for_id": {
      const orders = asNumber(rows[0]?.orderCount ?? rows[0]?.ordercount) ?? 0;
      return `Customer ${f.customerId} has ${orders} order${orders === 1 ? "" : "s"}.`;
    }
    case "avg_spend_by_type": {
      if (!rows.length) return "No average spend by type was found.";
      return `Average spend by customer type:\n${bullets(rows, (r) => {
        const avg = asNumber(r.avgSpend ?? r.avgspend);
        return `${typeLabel(r.customerType ?? r.customertype)}: ${avg == null ? "n/a" : money(avg)}`;
      })}`;
    }
    case "compare_customer_types_spend": {
      if (!rows.length) return "No customer type spend comparison was found.";
      return `Spend by customer type:\n${bullets(rows, (r) => {
        const sales = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        const n = asNumber(r.customerCount ?? r.customercount) ?? 0;
        return `${typeLabel(r.customerType ?? r.customertype)}: ${money(sales)} (${n} customers)`;
      })}`;
    }
    default:
      return null;
  }
}
