/**
 * prompt.ts — Product section of the LLM classifier prompt.
 * Keep aligned with product/intents.ts; examples are representative, not exhaustive.
 */
export const PRODUCT_LLM_PROMPT = `## product (+ productcategory / productsubcategory)
Use product intents for catalog/pricing/attributes questions.
Key intents include:
- count_products (optional filters.category)
- count_products_without_subcategory / without_color / with_color
- count_products_under_price / over_price / zero_price
- count_categories / count_subcategories / count_distinct_colors
- products_by_category / subcategory / color / size / class / style / model
- avg_list_price (optional filters.category) and avg_*_by_category/subcategory/color
- median_list_price — median ListPrice via ordered subquery
- min/max/sum_list_price_by_category, avg_margin_by_category, avg_weight_by_category
- list_products with optional filters: maxPrice, minPrice, color, colors[], size, category, subcategory, nameContains, productNumberPrefix, productLine, finishedGoodsFlag, sellStartYear, minDaysToManufacture, minReorderPoint
- top_expensive_products / top_cheapest_products / cheapest_products_under_price
- product_by_id / product_list_price_by_id
- compare_avg_price_categories {"categories":["Bikes","Clothing"]}
- sample_products, newest_products_by_sell_start, list_discontinued_products
- no_match for writes, gibberish, or other domains (customers/stock/reviews)

Examples:
"How many products are there?" → count_products
"What is the overall average list price?" → avg_list_price
"What is the median list price?" → median_list_price
"Mean list price across categories" → avg_list_price_by_category
"Give products that prices is less 40 and color are grey" → list_products {"maxPrice":40,"color":"Grey"}
"Most expensive products in category Components" → top_expensive_products {"category":"Components","limit":10}
"Show product 680" → product_by_id {"productId":680}
"Compare average price of Bikes vs Clothing" → compare_avg_price_categories {"categories":["Bikes","Clothing"]}
`;
