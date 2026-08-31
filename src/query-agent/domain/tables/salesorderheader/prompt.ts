/**
 * prompt.ts — salesorderheader section of the LLM classifier prompt.
 */
export const SALES_ORDER_HEADER_LLM_PROMPT = `## salesorderheader (orders)
- count_sales_orders — COUNT(*) sales orders
- last_sale / first_sale — most recent / earliest order by OrderDate
- last_sale_due_date / last_sale_ship_date — DueDate / ShipDate of latest order
- sales_value_over_period — SUM(TotalDue) last N months (filters.lastMonths)
- average_order_value / min_order_value / max_order_value / median_order_value / variance_order_value
- average_order_value_online / average_order_value_offline — AVG(TotalDue) where OnlineOrderFlag=1/0
- average_order_value_over_period — AVG(TotalDue) last N months
- avg_order_value_by_year / avg_order_value_by_territory
- average_freight / average_tax
- count_online_orders / count_offline_orders / pct_online_orders
- total_sales_value / total_subtotal / total_tax / total_freight
- sales_orders_by_year — COUNT + SUM by YEAR(OrderDate); optional filters.sort=orderYear|orderCount|salesValue, sortDir=asc|desc
- sales_value_by_year / sales_value_by_month / sales_orders_by_month
- sales_orders_by_status / sales_value_by_status / sales_orders_by_territory
- count_orders_by_year / sales_value_in_year — filters.year
- compare_sales_years — filters.years=[y1,y2]
- count_orders_last_days / list_orders_last_days — filters.lastDays, limit
- count_orders_for_customer / list_orders_for_customer — filters.customerId
- count_orders_for_salesperson / list_orders_for_salesperson — filters.salesPersonId
- order_by_id — filters.salesOrderId
- top_orders_by_value / lowest_orders_by_value / latest_orders / oldest_orders / sample_orders
- list_orders_min_value / list_orders_max_value — filters.minTotalDue / maxTotalDue
- list_orders_year_range — filters.minYear, maxYear
- count_orders_with_po / count_orders_without_comment / list_orders_with_comments
- count_orders_shipped_period — ShipDate in last N months
- count_orders_by_status / list_orders_by_status — filters.status
- top_year_by_order_count / top_year_by_sales_value
- count_distinct_customers_with_orders — COUNT(DISTINCT CustomerID)

Examples:
"What was the last sale?" → last_sale
"What was the first sale?" → first_sale
"How many online sales orders are there?" → count_online_orders
"Sales value by year" → sales_value_by_year
"Compare sales value of 2013 vs 2014" → compare_sales_years {years:[2013,2014]}
"Top 10 orders by TotalDue" → top_orders_by_value {limit:10}
"Mean order TotalDue" → average_order_value
"Order count grouped by year sorted by count" → sales_orders_by_year {sort:"orderCount", sortDir:"desc"}
Important: top/least selling products belong to salesorderdetail, not here.`;
