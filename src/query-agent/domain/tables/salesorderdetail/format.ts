/**
 * format.ts — salesorderdetail natural-language answers.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";

const asNumber = (raw: unknown): number | null => {
  if (raw == null) return null;
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

const asText = (raw: unknown, fallback = "Unknown"): string => {
  if (raw == null) return fallback;
  const s = String(raw).trim();
  return s || fallback;
}

const money = (n: number): string => {
  return `$${n.toFixed(2)}`;
}

const fmtNum = (n: number): string => {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const bulletLines = (
  rows: Record<string, unknown>[],
  map: (r: Record<string, unknown>) => string,
): string => {
  return rows.map((r) => `• ${map(r)}`).join("\n");
}

export const formatSalesOrderDetailAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null => {
  const f = plan.filters;

  switch (plan.intent) {
    case "count_order_lines": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} order line${count === 1 ? "" : "s"}.`;
    }
    case "sum_order_qty": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      return `Total quantity sold across order lines is ${qty}.`;
    }
    case "top_products_by_sales":
    case "least_sold_products":
    case "top_products_by_sales_category":
    case "least_sold_products_category":
    case "top_products_by_sales_color":
    case "top_products_by_sales_period":
    case "top_products_by_sales_max_price": {
      if (!rows.length) return "No sold products were found.";
      const labels: Record<string, string> = {
        top_products_by_sales: "Top selling products",
        least_sold_products: "Least sold products",
        top_products_by_sales_category: `Top selling products in ${asText(f.category, "category")}`,
        least_sold_products_category: `Least sold products in ${asText(f.category, "category")}`,
        top_products_by_sales_color: `Top selling ${asText(f.color, "")} products`.trim(),
        top_products_by_sales_period: `Top selling products (last ${asNumber(f.lastMonths) ?? 12} months)`,
        top_products_by_sales_max_price: `Top selling products under ${money(asNumber(f.maxPrice) ?? 50)} list price`,
      };
      const label = labels[plan.intent] ?? "Products";
      return `${label}:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        const value = asNumber(r.salesValue ?? r.salesvalue);
        return `${name}: ${qty} sold${value == null ? "" : ` (${money(value)})`}`;
      })}`;
    }
    case "sales_qty_by_product": {
      if (!rows.length) return "No quantity sold by product was found.";
      return `Quantity sold by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `${name}: ${qty}`;
      })}`;
    }
    case "top_products_by_revenue":
    case "least_products_by_revenue": {
      if (!rows.length) return "No product revenue was found.";
      const label =
        plan.intent === "top_products_by_revenue"
          ? "Top products by revenue"
          : "Least products by revenue";
      return `${label}:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const revenue = asNumber(r.revenue) ?? 0;
        return `${name}: ${money(revenue)}`;
      })}`;
    }
    case "avg_order_qty": {
      const n = asNumber(rows[0]?.avgQty ?? rows[0]?.avgqty);
      if (n == null) return "No average order quantity was found.";
      return `The average order quantity per line is ${fmtNum(n)}.`;
    }
    case "avg_unit_price": {
      const n = asNumber(rows[0]?.avgUnitPrice ?? rows[0]?.avgunitprice);
      if (n == null) return "No average unit price was found.";
      return `The average unit price on order lines is ${money(n)}.`;
    }
    case "sum_line_total": {
      const n = asNumber(rows[0]?.totalLineTotal ?? rows[0]?.totallinetotal) ?? 0;
      return `The sum of line totals is ${money(n)}.`;
    }
    case "line_total_by_product": {
      if (!rows.length) return "No line totals by product were found.";
      return `Line total by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const total = asNumber(r.lineTotal ?? r.linetotal) ?? 0;
        return `${name}: ${money(total)}`;
      })}`;
    }
    case "count_lines_for_order": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      const id = asNumber(f.salesOrderId) ?? 0;
      return `Sales order ${id} has ${count} line${count === 1 ? "" : "s"}.`;
    }
    case "list_lines_for_order": {
      if (!rows.length) return "No order lines were found for that sales order.";
      const id = asNumber(f.salesOrderId) ?? 0;
      return `Order lines for sales order ${id}:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const productId = asNumber(r.productId ?? r.productid) ?? 0;
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        const total = asNumber(r.lineTotal ?? r.linetotal);
        return `Line ${lineId}: product ${productId}, qty ${qty}${total == null ? "" : `, ${money(total)}`}`;
      })}`;
    }
    case "count_lines_for_product": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      const id = asNumber(f.productId) ?? 0;
      return `Product ${id} appears on ${count} order line${count === 1 ? "" : "s"}.`;
    }
    case "sales_qty_for_product": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      const id = asNumber(f.productId) ?? 0;
      return `Quantity sold for product ${id} is ${qty}.`;
    }
    case "list_lines_for_product": {
      if (!rows.length) return "No order lines were found for that product.";
      const id = asNumber(f.productId) ?? 0;
      return `Order lines for product ${id}:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const orderId = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        return `Line ${lineId} (order ${orderId}): qty ${qty}`;
      })}`;
    }
    case "avg_qty_by_product": {
      if (!rows.length) return "No average quantity by product was found.";
      return `Average quantity sold by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const qty = asNumber(r.avgQty ?? r.avgqty) ?? 0;
        return `${name}: ${fmtNum(qty)}`;
      })}`;
    }
    case "max_order_qty": {
      const n = asNumber(rows[0]?.maxQty ?? rows[0]?.maxqty);
      if (n == null) return "No max order qty was found.";
      return `The maximum order qty on a single line is ${n}.`;
    }
    case "min_order_qty": {
      const n = asNumber(rows[0]?.minQty ?? rows[0]?.minqty);
      if (n == null) return "No min order qty was found.";
      return `The minimum order qty on a single line is ${n}.`;
    }
    case "list_lines_min_qty": {
      if (!rows.length) return "No order lines matched that quantity filter.";
      const minQty = asNumber(f.minQty) ?? 0;
      return `Order lines with quantity over ${minQty}:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        return `Line ${lineId}: qty ${qty}`;
      })}`;
    }
    case "list_lines_max_unit_price": {
      if (!rows.length) return "No order lines matched that unit price filter.";
      const max = asNumber(f.maxUnitPrice) ?? 0;
      return `Lines with unit price under ${money(max)}:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const price = asNumber(r.unitPrice ?? r.unitprice) ?? 0;
        return `Line ${lineId}: ${money(price)}`;
      })}`;
    }
    case "sales_qty_by_category": {
      if (!rows.length) return "No quantity sold by category was found.";
      return `Quantity sold by category:\n${bulletLines(rows, (r) => {
        const name = asText(r.categoryName ?? r.categoryname);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `${name}: ${qty}`;
      })}`;
    }
    case "line_total_by_category": {
      if (!rows.length) return "No line totals by category were found.";
      return `Line total by category:\n${bulletLines(rows, (r) => {
        const name = asText(r.categoryName ?? r.categoryname);
        const total = asNumber(r.lineTotal ?? r.linetotal) ?? 0;
        return `${name}: ${money(total)}`;
      })}`;
    }
    case "sales_qty_by_subcategory": {
      if (!rows.length) return "No quantity sold by subcategory was found.";
      return `Quantity sold by subcategory:\n${bulletLines(rows, (r) => {
        const name = asText(r.subcategoryName ?? r.subcategoryname);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `${name}: ${qty}`;
      })}`;
    }
    case "sales_qty_by_color": {
      if (!rows.length) return "No quantity sold by color was found.";
      return `Quantity sold by color:\n${bulletLines(rows, (r) => {
        const color = asText(r.color);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `${color}: ${qty}`;
      })}`;
    }
    case "count_distinct_products_sold": {
      const count = asNumber(rows[0]?.productCount ?? rows[0]?.productcount) ?? 0;
      return `${count} distinct product${count === 1 ? "" : "s"} appear on order lines.`;
    }
    case "count_products_never_sold": {
      const count = asNumber(rows[0]?.productCount ?? rows[0]?.productcount) ?? 0;
      return `${count} product${count === 1 ? "" : "s"} ${count === 1 ? "has" : "have"} never been sold.`;
    }
    case "list_sold_products": {
      if (!rows.length) return "No sold products were found.";
      return `Products that have been sold:\n${bulletLines(rows, (r) => {
        return asText(r.productName ?? r.productname);
      })}`;
    }
    case "avg_line_total": {
      const n = asNumber(rows[0]?.avgLineTotal ?? rows[0]?.avglinetotal);
      if (n == null) return "No average line total was found.";
      return `The average line total is ${money(n)}.`;
    }
    case "median_order_qty": {
      const n = asNumber(rows[0]?.medianQty ?? rows[0]?.medianqty);
      if (n == null) return "No median order qty was found.";
      return `The median order qty is ${fmtNum(n)}.`;
    }
    case "variance_order_qty": {
      const n = asNumber(rows[0]?.varianceQty ?? rows[0]?.varianceqty);
      if (n == null) return "No variance of order qty was found.";
      return `The variance of order qty is ${fmtNum(n)}.`;
    }
    case "sales_qty_by_year": {
      if (!rows.length) return "No sales qty by year was found.";
      return `Sales qty by year:\n${bulletLines(rows, (r) => {
        const year = asNumber(r.orderYear ?? r.orderyear) ?? 0;
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `${year}: ${qty}`;
      })}`;
    }
    case "line_total_by_year": {
      if (!rows.length) return "No line totals by year were found.";
      return `Line totals by year:\n${bulletLines(rows, (r) => {
        const year = asNumber(r.orderYear ?? r.orderyear) ?? 0;
        const total = asNumber(r.lineTotal ?? r.linetotal) ?? 0;
        return `${year}: ${money(total)}`;
      })}`;
    }
    case "sum_order_qty_period": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      const months = asNumber(f.lastMonths) ?? 3;
      return `Quantity sold over the last ${months} months is ${qty}.`;
    }
    case "compare_product_qty": {
      if (!rows.length) return "No quantity comparison was found.";
      return `Quantity sold comparison:\n${bulletLines(rows, (r) => {
        const id = asNumber(r.productId ?? r.productid) ?? 0;
        const name = asText(r.productName ?? r.productname);
        const qty = asNumber(r.qtySold ?? r.qtysold) ?? 0;
        return `Product ${id} (${name}): ${qty}`;
      })}`;
    }
    case "line_by_id": {
      if (!rows.length) return "That order detail was not found.";
      const r = rows[0];
      const id = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
      const orderId = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
      const productId = asNumber(r.productId ?? r.productid) ?? 0;
      const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
      const total = asNumber(r.lineTotal ?? r.linetotal);
      return `Order detail ${id}: sales order ${orderId}, product ${productId}, qty ${qty}${total == null ? "" : `, line total ${money(total)}`}.`;
    }
    case "sample_order_lines":
    case "latest_order_lines": {
      if (!rows.length) return "No order lines were found.";
      const label =
        plan.intent === "sample_order_lines"
          ? "Sample order lines"
          : "Latest order lines";
      return `${label}:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const orderId = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        return `Line ${lineId} (order ${orderId}): qty ${qty}`;
      })}`;
    }
    case "sum_order_qty_category": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      const cat = asText(f.category, "that category");
      return `Total quantity sold for category ${cat} is ${qty}.`;
    }
    case "avg_unit_price_by_product": {
      if (!rows.length) return "No average unit price by product was found.";
      return `Average unit price by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const price = asNumber(r.avgUnitPrice ?? r.avgunitprice) ?? 0;
        return `${name}: ${money(price)}`;
      })}`;
    }
    case "count_discounted_lines": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} discounted line${count === 1 ? "" : "s"}.`;
    }
    case "list_discounted_lines": {
      if (!rows.length) return "No discounted lines were found.";
      return `Discounted lines:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const discount = asNumber(r.unitPriceDiscount ?? r.unitpricediscount) ?? 0;
        return `Line ${lineId}: discount ${fmtNum(discount)}`;
      })}`;
    }
    case "sum_line_discount": {
      const n = asNumber(rows[0]?.totalDiscount ?? rows[0]?.totaldiscount) ?? 0;
      return `The sum of discounts on order lines is ${money(n)}.`;
    }
    case "count_lines_online_orders": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} order line${count === 1 ? "" : "s"} for online orders.`;
    }
    case "sum_order_qty_finished_goods": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      return `Quantity sold for finished goods is ${qty}.`;
    }
    case "count_lines_with_tracking": {
      const count = asNumber(rows[0]?.lineCount ?? rows[0]?.linecount) ?? 0;
      return `${count} order line${count === 1 ? "" : "s"} have a carrier tracking number.`;
    }
    case "list_lines_without_tracking": {
      if (!rows.length) return "No order lines without tracking were found.";
      return `Order lines without carrier tracking:\n${bulletLines(rows, (r) => {
        const lineId = asNumber(r.salesOrderDetailId ?? r.salesorderdetailid) ?? 0;
        const orderId = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        return `Line ${lineId} (order ${orderId})`;
      })}`;
    }
    case "avg_lines_per_order": {
      const n = asNumber(rows[0]?.avgLines ?? rows[0]?.avglines);
      if (n == null) return "No average lines per order was found.";
      return `The average number of lines per sales order is ${fmtNum(n)}.`;
    }
    case "orders_most_lines": {
      if (!rows.length) return "No sales orders were found.";
      return `Sales orders with most line items:\n${bulletLines(rows, (r) => {
        const id = asNumber(r.salesOrderId ?? r.salesorderid) ?? 0;
        const count = asNumber(r.lineCount ?? r.linecount) ?? 0;
        return `Order ${id}: ${count} line${count === 1 ? "" : "s"}`;
      })}`;
    }
    case "count_lines_by_special_offer": {
      if (!rows.length) return "No special offer usage was found.";
      return `Special offer id usage counts:\n${bulletLines(rows, (r) => {
        const id = asNumber(r.specialOfferId ?? r.specialofferid) ?? 0;
        const count = asNumber(r.lineCount ?? r.linecount) ?? 0;
        return `Offer ${id}: ${count}`;
      })}`;
    }
    case "pct_lines_for_product": {
      const pct = asNumber(rows[0]?.pctLines ?? rows[0]?.pctlines);
      const id = asNumber(f.productId) ?? 0;
      if (pct == null) return `No percentage was found for product ${id}.`;
      return `${fmtNum(pct)}% of order lines are for product ${id}.`;
    }
    case "min_line_total": {
      const n = asNumber(rows[0]?.minLineTotal ?? rows[0]?.minlinetotal);
      if (n == null) return "No min line total was found.";
      return `The minimum line total is ${money(n)}.`;
    }
    case "max_line_total": {
      const n = asNumber(rows[0]?.maxLineTotal ?? rows[0]?.maxlinetotal);
      if (n == null) return "No max line total was found.";
      return `The maximum line total is ${money(n)}.`;
    }
    case "list_lines_for_color": {
      if (!rows.length) return "No order lines were found for that color.";
      const color = asText(f.color, "that color");
      return `Order details for ${color} products:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const qty = asNumber(r.orderQty ?? r.orderqty) ?? 0;
        return `${name}: qty ${qty}`;
      })}`;
    }
    case "sum_order_qty_make_flag": {
      const qty = asNumber(rows[0]?.totalQty ?? rows[0]?.totalqty) ?? 0;
      return `Quantity sold for products with MakeFlag=1 is ${qty}.`;
    }
    default:
      return null;
  }
}
