/**
 * prompt.ts — mixed join section of the LLM classifier prompt.
 */
export const MIXED_LLM_PROMPT = `## mixed (cross-table joins)
Use when the question combines product + customer/contact + sales in one ask.

- products_sold_to_named_customers
  filters: productNameContains, customerNameContains, optional lastMonths, optional category, limit
  Joins: product → salesorderdetail → salesorderheader → customer → individual → contact

Examples:
"Give products name Tire that sales in last 2 year and customer have names like Miranda"
  → products_sold_to_named_customers {productNameContains:"Tire", customerNameContains:"Miranda", lastMonths:24}
"Show orders of products like Helmet bought by customers named like Adams in the last 1 years"
  → products_sold_to_named_customers {productNameContains:"Helmet", customerNameContains:"Adams", lastMonths:12}

If only one domain (only products, only customers, only orders), use that entity module instead.`;
