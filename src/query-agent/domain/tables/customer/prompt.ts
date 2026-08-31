/**
 * prompt.ts — customer section of the LLM classifier prompt.
 */
export const CUSTOMER_LLM_PROMPT = `## customer
CustomerType I=Individual, S=Store. Contact fields via individual→contact:
Title, FirstName, MiddleName, LastName, Suffix, EmailAddress, EmailPromotion, Phone
(never PasswordHash/PasswordSalt). Store customers may lack contact — then use AccountNumber.
Do not invent names.

Counts: count_customers, count_store_customers, count_individual_customers,
count_customers_by_type (customerType), count_customers_by_territory (territoryId),
count_customers_with_orders, count_customers_without_orders,
pct_customers_with_orders, pct_customers_by_type,
customers_by_type, customers_by_territory, customer_count_by_territory_type.

Lookup / lists: customer_by_id, customer_by_account (accountNumber),
customers_by_name (firstName/lastName/nameContains/email/phone),
count_customers_by_name (same filters),
orders_for_customers_by_name (same contact filters + optional lastMonths; joins salesorderheader),
list_customers, sample_customers, latest_customers, oldest_customers,
list_customers_with_orders, list_customers_without_orders,
customers_modified_after (year), random_sample_store_customers.

Spend rankings (join salesorderheader): top_customers_by_sales, lowest_customers_by_sales,
top_customers_by_order_count, lowest_customers_by_order_count,
customers_by_category_spend (category + join detail/product/category),
top_customers_by_sales_period (lastMonths), top_customers_by_sales_type,
top_customers_by_sales_territory, top_account_numbers_by_sales,
customers_spend_over (minSpend), customers_spend_under (maxSpend),
customers_with_min_orders (minOrders).

Aggregates: avg_customer_spend, median_customer_spend, sum_customer_spend,
max/min_customer_spend, variance_customer_spend, avg_orders_per_customer,
customer_spend_for_id, avg_spend_by_type, avg_spend_by_territory,
compare_customer_types_spend.

Examples:
"How many customers do I have?" → count_customers
"Customers with first name Michelle" → customers_by_name {firstName:"Michelle"}
"How many customers have last name Adams?" → count_customers_by_name {lastName:"Adams"}
"Customer with email michelle2@adventure-works.com" → customers_by_name {email:"michelle2@adventure-works.com"}
"Customer with phone 150-555-0113" → customers_by_name {phone:"150-555-0113"}
"Show me orders of customers that name like Miranda, sales last 1 year" → orders_for_customers_by_name {nameContains:"Miranda", lastMonths:12}
"Show the top 10 customers by sales" → top_customers_by_sales {limit:10}
"Which customers spend the most in category Bikes?" → customers_by_category_spend {category:"Bikes"}
Important: "how many orders does customer N have?" belongs to salesorderheader, not here.`;
