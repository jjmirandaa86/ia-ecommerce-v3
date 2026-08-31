/**
 * prompt.ts — salesorderdetail section of the LLM classifier prompt.
 */
export const SALES_ORDER_DETAIL_LLM_PROMPT = `## salesorderdetail (order lines / product sales)
Line metrics: count_order_lines, sum_order_qty, avg_order_qty, max_order_qty, min_order_qty,
median_order_qty, variance_order_qty, avg_unit_price, sum_line_total, avg_line_total,
min_line_total, max_line_total, sum_line_discount, count_discounted_lines, list_discounted_lines,
count_lines_with_tracking, list_lines_without_tracking, avg_lines_per_order, orders_most_lines,
count_lines_by_special_offer, sample_order_lines, latest_order_lines, line_by_id (salesOrderDetailId).

Product rankings: top_products_by_sales / least_sold_products (limit),
top_products_by_revenue / least_products_by_revenue (limit),
sales_qty_by_product, line_total_by_product, avg_qty_by_product, avg_unit_price_by_product,
count_distinct_products_sold, count_products_never_sold, list_sold_products (limit),
compare_product_qty (productIds).

Scoped: count_lines_for_order / list_lines_for_order (salesOrderId, limit),
count_lines_for_product / sales_qty_for_product / list_lines_for_product / pct_lines_for_product (productId),
list_lines_min_qty (minQty), list_lines_max_unit_price (maxUnitPrice),
list_lines_for_color (color), top_products_by_sales_color (color, limit),
top_products_by_sales_category / least_sold_products_category / sum_order_qty_category (category),
sales_qty_by_category, line_total_by_category, sales_qty_by_subcategory, sales_qty_by_color,
top_products_by_sales_max_price (maxPrice, limit).

Period / flags (join header or product): sales_qty_by_year, line_total_by_year,
top_products_by_sales_period (lastMonths, limit), sum_order_qty_period (lastMonths),
count_lines_online_orders, sum_order_qty_finished_goods, sum_order_qty_make_flag.

Examples:
"What are the top selling products?" → top_products_by_sales {limit:10}
"Which products sell the most?" → top_products_by_sales {limit:10}
"Which products sell the least?" → least_sold_products {limit:10}
"Top products by revenue" → top_products_by_revenue {limit:10}
"How many order lines are there?" → count_order_lines
"Qty sold mentioning make flag" → sum_order_qty_make_flag
Important: last sale / sales value / order counts belong to salesorderheader, not here.`;
