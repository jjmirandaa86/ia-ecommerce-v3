/**
 * format.ts — salesorderheader natural-language answers.
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

const formatOrderLine = (r: Record<string, unknown>): string => {
  const id = asNumber(r.salesOrderId ?? r.salesorderid) ?? "?";
  const date = String(r.orderDate ?? r.orderdate ?? "");
  const total = asNumber(r.totalDue ?? r.totaldue);
  return `• #${id}${date ? ` on ${date}` : ""}${total != null ? ` — ${money(total)}` : ""}`;
}

export const formatSalesOrderHeaderAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null => {
  const f = plan.filters;

  switch (plan.intent) {
    case "count_sales_orders":
    case "count_online_orders":
    case "count_offline_orders":
    case "count_orders_with_po":
    case "count_orders_without_comment":
    case "count_orders_by_year":
    case "count_orders_last_days":
    case "count_orders_for_customer":
    case "count_orders_for_salesperson":
    case "count_orders_shipped_period":
    case "count_orders_by_status": {
      const count = asNumber(rows[0]?.orderCount ?? rows[0]?.ordercount) ?? 0;
      const label =
        plan.intent === "count_online_orders"
          ? "online sales order"
          : plan.intent === "count_offline_orders"
            ? "offline sales order"
            : "sales order";
      return `There ${count === 1 ? "is" : "are"} ${count} ${label}${count === 1 ? "" : "s"}.`;
    }
    case "count_distinct_customers_with_orders": {
      const count = asNumber(rows[0]?.customerCount ?? rows[0]?.customercount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} distinct customer${count === 1 ? "" : "s"} with orders.`;
    }
    case "last_sale":
    case "first_sale": {
      const row = rows[0];
      if (!row) return "No sales orders were found.";
      const id = asNumber(row.salesOrderId ?? row.salesorderid) ?? 0;
      const date = String(row.orderDate ?? row.orderdate ?? "");
      const customerId = asNumber(row.customerId ?? row.customerid);
      const total = asNumber(row.totalDue ?? row.totaldue);
      const which = plan.intent === "first_sale" ? "first" : "last";
      return `The ${which} sale was order #${id}${date ? ` on ${date}` : ""}${
        customerId != null ? ` for customer ${customerId}` : ""
      }${total != null ? ` totaling ${money(total)}` : ""}.`;
    }
    case "last_sale_due_date": {
      const row = rows[0];
      if (!row) return "No sales orders were found.";
      const id = asNumber(row.salesOrderId ?? row.salesorderid) ?? 0;
      const due = String(row.dueDate ?? row.duedate ?? "");
      return `The due date of the last sale (order #${id}) is ${due || "unknown"}.`;
    }
    case "last_sale_ship_date": {
      const row = rows[0];
      if (!row) return "No sales orders were found.";
      const id = asNumber(row.salesOrderId ?? row.salesorderid) ?? 0;
      const ship = String(row.shipDate ?? row.shipdate ?? "");
      return `The ship date of the most recent order (order #${id}) is ${ship || "unknown"}.`;
    }
    case "sales_value_over_period": {
      const value = asNumber(rows[0]?.salesValue ?? rows[0]?.salesvalue) ?? 0;
      const months = asNumber(f.lastMonths) ?? 3;
      return `Sales value over the last ${months} month${months === 1 ? "" : "s"} is ${money(value)}.`;
    }
    case "sales_value_in_year": {
      const value = asNumber(rows[0]?.salesValue ?? rows[0]?.salesvalue) ?? 0;
      const year = asNumber(f.year) ?? "?";
      return `Sales value in ${year} is ${money(value)}.`;
    }
    case "total_sales_value": {
      const value = asNumber(rows[0]?.salesValue ?? rows[0]?.salesvalue) ?? 0;
      return `Total sales value of all orders is ${money(value)}.`;
    }
    case "total_subtotal": {
      const value = asNumber(rows[0]?.totalSubTotal ?? rows[0]?.totalsubtotal) ?? 0;
      return `Total SubTotal of all orders is ${money(value)}.`;
    }
    case "total_tax": {
      const value = asNumber(rows[0]?.totalTax ?? rows[0]?.totaltax) ?? 0;
      return `Sum of tax amounts on orders is ${money(value)}.`;
    }
    case "total_freight": {
      const value = asNumber(rows[0]?.totalFreight ?? rows[0]?.totalfreight) ?? 0;
      return `Sum of freight on sales orders is ${money(value)}.`;
    }
    case "average_order_value":
    case "average_order_value_online":
    case "average_order_value_offline":
    case "average_order_value_over_period": {
      const n = asNumber(rows[0]?.avgOrderValue ?? rows[0]?.avgordervalue);
      if (n == null) return "No order values were found.";
      if (plan.intent === "average_order_value_online") {
        return `The average order value for online orders is ${money(n)}.`;
      }
      if (plan.intent === "average_order_value_offline") {
        return `The average order value for offline orders is ${money(n)}.`;
      }
      if (plan.intent === "average_order_value_over_period") {
        const months = asNumber(f.lastMonths) ?? 3;
        return `The average order value over the last ${months} month${months === 1 ? "" : "s"} is ${money(n)}.`;
      }
      return `The average order value is ${money(n)}.`;
    }
    case "min_order_value": {
      const n = asNumber(rows[0]?.minOrderValue ?? rows[0]?.minordervalue);
      if (n == null) return "No order values were found.";
      return `The minimum order value is ${money(n)}.`;
    }
    case "max_order_value": {
      const n = asNumber(rows[0]?.maxOrderValue ?? rows[0]?.maxordervalue);
      if (n == null) return "No order values were found.";
      return `The maximum order value is ${money(n)}.`;
    }
    case "median_order_value": {
      const n = asNumber(rows[0]?.medianOrderValue ?? rows[0]?.medianordervalue);
      if (n == null) return "No median order value was found.";
      return `The median order value is ${money(n)}.`;
    }
    case "variance_order_value": {
      const n = asNumber(rows[0]?.varianceOrderValue ?? rows[0]?.varianceordervalue);
      if (n == null) return "No variance was found.";
      return `The variance of order TotalDue is ${n.toFixed(2)}.`;
    }
    case "average_freight": {
      const n = asNumber(rows[0]?.avgFreight ?? rows[0]?.avgfreight);
      if (n == null) return "No freight values were found.";
      return `The average freight per order is ${money(n)}.`;
    }
    case "average_tax": {
      const n = asNumber(rows[0]?.avgTax ?? rows[0]?.avgtax);
      if (n == null) return "No tax values were found.";
      return `The average tax per order is ${money(n)}.`;
    }
    case "pct_online_orders": {
      const n = asNumber(rows[0]?.pctOnline ?? rows[0]?.pctonline) ?? 0;
      return `Online orders are ${n.toFixed(1)}% of all sales orders.`;
    }
    case "sales_orders_by_year": {
      if (!rows.length) return "No sales orders by year were found.";
      const sort =
        f.sort === "orderCount"
          ? "order count"
          : f.sort === "salesValue"
            ? "sales value"
            : "year";
      const dir = f.sortDir === "desc" ? "descending" : "ascending";
      const sorted = f.sort != null ? ` (sorted by ${sort}, ${dir})` : "";
      const lines = rows.map((r) => {
        const year = String(r.orderYear ?? r.orderyear ?? "?");
        const count = asNumber(r.orderCount ?? r.ordercount) ?? 0;
        const value = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        return `• ${year}: ${count} order${count === 1 ? "" : "s"} (${money(value)})`;
      });
      return `Sales orders by year${sorted}:\n${lines.join("\n")}`;
    }
    case "sales_value_by_year":
    case "compare_sales_years": {
      if (!rows.length) return "No sales value by year was found.";
      const lines = rows.map((r) => {
        const year = String(r.orderYear ?? r.orderyear ?? "?");
        const value = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        return `• ${year}: ${money(value)}`;
      });
      const title =
        plan.intent === "compare_sales_years"
          ? "Sales value comparison by year"
          : "Sales value by year";
      return `${title}:\n${lines.join("\n")}`;
    }
    case "sales_value_by_month": {
      if (!rows.length) return "No sales value by month was found.";
      const lines = rows.map((r) => {
        const year = String(r.orderYear ?? r.orderyear ?? "?");
        const month = String(r.orderMonth ?? r.ordermonth ?? "?");
        const value = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        return `• ${year}-${month.padStart(2, "0")}: ${money(value)}`;
      });
      return `Sales value by month:\n${lines.join("\n")}`;
    }
    case "sales_orders_by_month": {
      if (!rows.length) return "No sales orders by month were found.";
      const lines = rows.map((r) => {
        const year = String(r.orderYear ?? r.orderyear ?? "?");
        const month = String(r.orderMonth ?? r.ordermonth ?? "?");
        const count = asNumber(r.orderCount ?? r.ordercount) ?? 0;
        return `• ${year}-${month.padStart(2, "0")}: ${count} order${count === 1 ? "" : "s"}`;
      });
      return `Sales orders by month:\n${lines.join("\n")}`;
    }
    case "sales_orders_by_status": {
      if (!rows.length) return "No sales orders by status were found.";
      const lines = rows.map((r) => {
        const status = String(r.status ?? "?");
        const count = asNumber(r.orderCount ?? r.ordercount) ?? 0;
        return `• status ${status}: ${count} order${count === 1 ? "" : "s"}`;
      });
      return `Sales orders by status:\n${lines.join("\n")}`;
    }
    case "sales_value_by_status": {
      if (!rows.length) return "No sales value by status was found.";
      const lines = rows.map((r) => {
        const status = String(r.status ?? "?");
        const value = asNumber(r.salesValue ?? r.salesvalue) ?? 0;
        return `• status ${status}: ${money(value)}`;
      });
      return `Sales value by status:\n${lines.join("\n")}`;
    }
    case "sales_orders_by_territory": {
      if (!rows.length) return "No sales orders by territory were found.";
      const lines = rows.map((r) => {
        const tid = String(r.territoryId ?? r.territoryid ?? "?");
        const count = asNumber(r.orderCount ?? r.ordercount) ?? 0;
        return `• territory ${tid}: ${count} order${count === 1 ? "" : "s"}`;
      });
      return `Sales orders by territory:\n${lines.join("\n")}`;
    }
    case "avg_order_value_by_year": {
      if (!rows.length) return "No average order values by year were found.";
      const lines = rows.map((r) => {
        const year = String(r.orderYear ?? r.orderyear ?? "?");
        const avg = asNumber(r.avgOrderValue ?? r.avgordervalue) ?? 0;
        return `• ${year}: ${money(avg)}`;
      });
      return `Average order value by year:\n${lines.join("\n")}`;
    }
    case "avg_order_value_by_territory": {
      if (!rows.length) return "No average order values by territory were found.";
      const lines = rows.map((r) => {
        const tid = String(r.territoryId ?? r.territoryid ?? "?");
        const avg = asNumber(r.avgOrderValue ?? r.avgordervalue) ?? 0;
        return `• territory ${tid}: ${money(avg)}`;
      });
      return `Average order value by territory:\n${lines.join("\n")}`;
    }
    case "order_by_id": {
      const row = rows[0];
      if (!row) return "No sales order was found for that id.";
      const id = asNumber(row.salesOrderId ?? row.salesorderid) ?? 0;
      const date = String(row.orderDate ?? row.orderdate ?? "");
      const total = asNumber(row.totalDue ?? row.totaldue);
      const status = asNumber(row.status);
      return `Sales order #${id}${date ? ` on ${date}` : ""}${
        status != null ? `, status ${status}` : ""
      }${total != null ? `, totaling ${money(total)}` : ""}.`;
    }
    case "top_year_by_order_count": {
      const row = rows[0];
      if (!row) return "No yearly order counts were found.";
      const year = String(row.orderYear ?? row.orderyear ?? "?");
      const count = asNumber(row.orderCount ?? row.ordercount) ?? 0;
      return `${year} had the most sales orders (${count}).`;
    }
    case "top_year_by_sales_value": {
      const row = rows[0];
      if (!row) return "No yearly sales values were found.";
      const year = String(row.orderYear ?? row.orderyear ?? "?");
      const value = asNumber(row.salesValue ?? row.salesvalue) ?? 0;
      return `${year} had the highest sales value (${money(value)}).`;
    }
    case "list_orders_last_days":
    case "list_orders_for_customer":
    case "list_orders_for_salesperson":
    case "list_orders_with_comments":
    case "list_orders_by_status":
    case "list_orders_min_value":
    case "list_orders_max_value":
    case "list_orders_year_range":
    case "top_orders_by_value":
    case "lowest_orders_by_value":
    case "latest_orders":
    case "oldest_orders":
    case "sample_orders": {
      if (!rows.length) return "No matching sales orders were found.";
      const titles: Record<string, string> = {
        list_orders_last_days: "Orders from the recent days",
        list_orders_for_customer: "Orders for customer",
        list_orders_for_salesperson: "Orders for salesperson",
        list_orders_with_comments: "Orders with comments",
        list_orders_by_status: "Orders by status",
        list_orders_min_value: "Orders above minimum TotalDue",
        list_orders_max_value: "Orders under maximum TotalDue",
        list_orders_year_range: "Orders in year range",
        top_orders_by_value: "Top orders by TotalDue",
        lowest_orders_by_value: "Lowest value orders",
        latest_orders: "Latest sales orders",
        oldest_orders: "Oldest sales orders",
        sample_orders: "Random sample of sales orders",
      };
      const title = titles[plan.intent] ?? "Sales orders";
      return `${title}:\n${rows.map(formatOrderLine).join("\n")}`;
    }
    default:
      return null;
  }
}
