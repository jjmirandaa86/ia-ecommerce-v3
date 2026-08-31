/**
 * Gold set — product entity (100 NL questions).
 *
 * expectedIntent / expectedFilters = what classify (heuristic or LLM) should return.
 * implemented = heuristic + SQL + format exist today (flip to true when you ship it).
 *
 * Run: npm test -- tests/unit/query-agent/product-questions.heuristic.test.ts
 */
export type ProductQuestionCase = {
  id: string;
  question: string;
  expectedIntent: string;
  expectedFilters?: Record<string, unknown>;
  implemented: boolean;
  notes?: string;
};

export const PRODUCT_QUESTION_CASES: ProductQuestionCase[] = [
  // —— Counts / coverage (implemented family) ——
  {
    id: "P001",
    question: "How many products are there?",
    expectedIntent: "count_products",
    implemented: true,
  },
  {
    id: "P002",
    question: "How many products do we have?",
    expectedIntent: "count_products",
    implemented: true,
  },
  {
    id: "P003",
    question: "Give me the total number of products",
    expectedIntent: "count_products",
    implemented: true,
  },
  {
    id: "P004",
    question: "Count all products",
    expectedIntent: "count_products",
    implemented: true,
  },
  {
    id: "P005",
    question: "How many products have no subcategory?",
    expectedIntent: "count_products_without_subcategory",
    implemented: true,
  },
  {
    id: "P006",
    question: "How many products are missing a subcategory?",
    expectedIntent: "count_products_without_subcategory",
    implemented: true,
  },
  {
    id: "P007",
    question: "Count products without subcategory",
    expectedIntent: "count_products_without_subcategory",
    implemented: true,
  },

  // —— Group by category / subcategory / color ——
  {
    id: "P008",
    question: "How many products are there per category?",
    expectedIntent: "products_by_category",
    implemented: true,
  },
  {
    id: "P009",
    question: "Show product totals by category",
    expectedIntent: "products_by_category",
    implemented: true,
  },
  {
    id: "P010",
    question: "How many products are there per subcategory?",
    expectedIntent: "products_by_subcategory",
    implemented: true,
  },
  {
    id: "P011",
    question: "Products by subcategory",
    expectedIntent: "products_by_subcategory",
    implemented: true,
  },
  {
    id: "P012",
    question: "List products by color",
    expectedIntent: "products_by_color",
    implemented: true,
  },
  {
    id: "P013",
    question: "How many products are there by color?",
    expectedIntent: "products_by_color",
    implemented: true,
  },
  {
    id: "P014",
    question: "What is the average list price by category?",
    expectedIntent: "avg_list_price_by_category",
    implemented: true,
  },
  {
    id: "P015",
    question: "Average list price per category",
    expectedIntent: "avg_list_price_by_category",
    implemented: true,
  },

  // —— Price ranking / under price ——
  {
    id: "P016",
    question: "What are the top 10 most expensive products?",
    expectedIntent: "top_expensive_products",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "P017",
    question: "Show the most expensive products",
    expectedIntent: "top_expensive_products",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "P018",
    question: "Top 5 most expensive products",
    expectedIntent: "top_expensive_products",
    expectedFilters: { limit: 5 },
    implemented: true,
  },
  {
    id: "P019",
    question: "What are the cheapest products under $50?",
    expectedIntent: "cheapest_products_under_price",
    expectedFilters: { maxPrice: 50, limit: 25 },
    implemented: true,
  },
  {
    id: "P020",
    question: "Cheapest products under 100",
    expectedIntent: "cheapest_products_under_price",
    expectedFilters: { maxPrice: 100 },
    implemented: true,
  },

  // —— list_products (1=1 filters) ——
  {
    id: "P021",
    question: "Give products that prices is less 40 and color are grey",
    expectedIntent: "list_products",
    expectedFilters: { maxPrice: 40, color: "Grey" },
    implemented: true,
  },
  {
    id: "P022",
    question: "Show products that color is black",
    expectedIntent: "list_products",
    expectedFilters: { color: "Black" },
    implemented: true,
  },
  {
    id: "P023",
    question: "Show products under $25",
    expectedIntent: "list_products",
    expectedFilters: { maxPrice: 25 },
    implemented: true,
  },
  {
    id: "P024",
    question: "List products that color is red under 200",
    expectedIntent: "list_products",
    expectedFilters: { maxPrice: 200, color: "Red" },
    implemented: true,
  },

  // —— Backlog: more aggregates ——
  {
    id: "P025",
    question: "What is the average list price by subcategory?",
    expectedIntent: "avg_list_price_by_subcategory",
    implemented: true,
  },
  {
    id: "P026",
    question: "What is the average list price by color?",
    expectedIntent: "avg_list_price_by_color",
    implemented: true,
  },
  {
    id: "P027",
    question: "What is the minimum list price by category?",
    expectedIntent: "min_list_price_by_category",
    implemented: true,
  },
  {
    id: "P028",
    question: "What is the maximum list price by category?",
    expectedIntent: "max_list_price_by_category",
    implemented: true,
  },
  {
    id: "P029",
    question: "Sum of list prices by category",
    expectedIntent: "sum_list_price_by_category",
    implemented: true,
  },
  {
    id: "P030",
    question: "How many products have no color?",
    expectedIntent: "count_products_without_color",
    implemented: true,
  },
  {
    id: "P031",
    question: "How many products have a color assigned?",
    expectedIntent: "count_products_with_color",
    implemented: true,
  },
  {
    id: "P032",
    question: "How many product categories are there?",
    expectedIntent: "count_categories",
    implemented: true,
  },
  {
    id: "P033",
    question: "How many product subcategories are there?",
    expectedIntent: "count_subcategories",
    implemented: true,
  },
  {
    id: "P034",
    question: "List all product categories",
    expectedIntent: "list_categories",
    implemented: true,
  },
  {
    id: "P035",
    question: "List all product subcategories",
    expectedIntent: "list_subcategories",
    implemented: true,
  },
  {
    id: "P036",
    question: "Which category has the most products?",
    expectedIntent: "top_category_by_product_count",
    implemented: true,
  },
  {
    id: "P037",
    question: "Which subcategory has the fewest products?",
    expectedIntent: "bottom_subcategory_by_product_count",
    implemented: true,
  },
  {
    id: "P038",
    question: "Which color is most common among products?",
    expectedIntent: "top_color_by_product_count",
    implemented: true,
  },

  // —— Backlog: price ranges / stats ——
  {
    id: "P039",
    question: "What is the overall average list price?",
    expectedIntent: "avg_list_price",
    implemented: true,
  },
  {
    id: "P040",
    question: "What is the median list price?",
    expectedIntent: "median_list_price",
    implemented: true,
  },
  {
    id: "P041",
    question: "What is the cheapest product?",
    expectedIntent: "cheapest_product",
    implemented: true,
  },
  {
    id: "P042",
    question: "What is the most expensive product?",
    expectedIntent: "most_expensive_product",
    implemented: true,
  },
  {
    id: "P043",
    question: "Show products with list price between 50 and 150",
    expectedIntent: "list_products",
    expectedFilters: { minPrice: 50, maxPrice: 150 },
    implemented: true,
    notes: "Extend list_products with minPrice",
  },
  {
    id: "P044",
    question: "Products priced over 1000",
    expectedIntent: "list_products",
    expectedFilters: { minPrice: 1000 },
    implemented: true,
  },
  {
    id: "P045",
    question: "How many products cost less than 20?",
    expectedIntent: "count_products_under_price",
    expectedFilters: { maxPrice: 20 },
    implemented: true,
  },
  {
    id: "P046",
    question: "How many products cost more than 500?",
    expectedIntent: "count_products_over_price",
    expectedFilters: { minPrice: 500 },
    implemented: true,
  },
  {
    id: "P047",
    question: "Top 20 cheapest products",
    expectedIntent: "top_cheapest_products",
    expectedFilters: { limit: 20 },
    implemented: true,
  },
  {
    id: "P048",
    question: "Products with zero list price",
    expectedIntent: "count_products_zero_price",
    implemented: true,
  },
  {
    id: "P049",
    question: "Products with list price greater than standard cost",
    expectedIntent: "products_price_above_cost",
    implemented: true,
  },
  {
    id: "P050",
    question: "What is the average margin by category?",
    expectedIntent: "avg_margin_by_category",
    implemented: true,
    notes: "ListPrice - StandardCost",
  },

  // —— Backlog: attributes (size, class, style, weight) ——
  {
    id: "P051",
    question: "List products by size",
    expectedIntent: "products_by_size",
    implemented: true,
  },
  {
    id: "P052",
    question: "How many products are there per size?",
    expectedIntent: "products_by_size",
    implemented: true,
  },
  {
    id: "P053",
    question: "Show products size L",
    expectedIntent: "list_products",
    expectedFilters: { size: "L" },
    implemented: true,
  },
  {
    id: "P054",
    question: "List products by class",
    expectedIntent: "products_by_class",
    implemented: true,
  },
  {
    id: "P055",
    question: "List products by style",
    expectedIntent: "products_by_style",
    implemented: true,
  },
  {
    id: "P056",
    question: "What is the average product weight by category?",
    expectedIntent: "avg_weight_by_category",
    implemented: true,
  },
  {
    id: "P057",
    question: "Heaviest 10 products",
    expectedIntent: "top_heavy_products",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "P058",
    question: "Lightest products under 10 kg",
    expectedIntent: "list_products_by_weight",
    expectedFilters: { maxWeight: 10 },
    implemented: true,
  },

  // —— Backlog: make / finished goods / sell dates ——
  {
    id: "P059",
    question: "How many products are make-to-order?",
    expectedIntent: "count_products_make_flag",
    expectedFilters: { makeFlag: true },
    implemented: true,
  },
  {
    id: "P060",
    question: "How many finished goods products are there?",
    expectedIntent: "count_finished_goods",
    implemented: true,
  },
  {
    id: "P061",
    question: "Products that are not finished goods",
    expectedIntent: "list_products",
    expectedFilters: { finishedGoodsFlag: false },
    implemented: true,
  },
  {
    id: "P062",
    question: "Which products were discontinued?",
    expectedIntent: "list_discontinued_products",
    implemented: true,
  },
  {
    id: "P063",
    question: "How many products are currently sellable?",
    expectedIntent: "count_sellable_products",
    implemented: true,
    notes: "SellEndDate IS NULL or in the future",
  },
  {
    id: "P064",
    question: "Products with sell start date in 2005",
    expectedIntent: "list_products",
    expectedFilters: { sellStartYear: 2005 },
    implemented: true,
  },
  {
    id: "P065",
    question: "Newest products by sell start date",
    expectedIntent: "newest_products_by_sell_start",
    expectedFilters: { limit: 10 },
    implemented: true,
  },

  // —— Backlog: name / id lookup ——
  {
    id: "P066",
    question: "Find products named like helmet",
    expectedIntent: "list_products",
    expectedFilters: { nameContains: "helmet" },
    implemented: true,
  },
  {
    id: "P067",
    question: "Show product 680",
    expectedIntent: "product_by_id",
    expectedFilters: { productId: 680 },
    implemented: true,
  },
  {
    id: "P068",
    question: "What is the list price of product 680?",
    expectedIntent: "product_list_price_by_id",
    expectedFilters: { productId: 680 },
    implemented: true,
  },
  {
    id: "P069",
    question: "Products with product number starting with BK",
    expectedIntent: "list_products",
    expectedFilters: { productNumberPrefix: "BK" },
    implemented: true,
  },
  {
    id: "P070",
    question: "Search products containing mountain",
    expectedIntent: "list_products",
    expectedFilters: { nameContains: "mountain" },
    implemented: true,
  },

  // —— Backlog: category / subcategory filters ——
  {
    id: "P071",
    question: "How many products are in category Bikes?",
    expectedIntent: "count_products",
    expectedFilters: { category: "Bikes" },
    implemented: true,
    notes: "Or dedicated count with category filter on list/count",
  },
  {
    id: "P072",
    question: "List products in category Clothing",
    expectedIntent: "list_products",
    expectedFilters: { category: "Clothing" },
    implemented: true,
  },
  {
    id: "P073",
    question: "List products in subcategory Helmets",
    expectedIntent: "list_products",
    expectedFilters: { subcategory: "Helmets" },
    implemented: true,
  },
  {
    id: "P074",
    question: "Average list price for category Bikes",
    expectedIntent: "avg_list_price",
    expectedFilters: { category: "Bikes" },
    implemented: true,
  },
  {
    id: "P075",
    question: "Most expensive products in category Components",
    expectedIntent: "top_expensive_products",
    expectedFilters: { category: "Components", limit: 10 },
    implemented: true,
  },
  {
    id: "P076",
    question: "Black products in category Bikes under 1500",
    expectedIntent: "list_products",
    expectedFilters: { category: "Bikes", color: "Black", maxPrice: 1500 },
    implemented: true,
  },
  {
    id: "P077",
    question: "Which subcategories belong to category Bikes?",
    expectedIntent: "subcategories_by_category",
    expectedFilters: { category: "Bikes" },
    implemented: true,
  },
  {
    id: "P078",
    question: "Category for subcategory Jerseys",
    expectedIntent: "category_for_subcategory",
    expectedFilters: { subcategory: "Jerseys" },
    implemented: true,
  },

  // —— Backlog: days to manufacture / safety / reorder ——
  {
    id: "P079",
    question: "Average days to manufacture by category",
    expectedIntent: "avg_days_to_manufacture_by_category",
    implemented: true,
  },
  {
    id: "P080",
    question: "Products that take more than 3 days to manufacture",
    expectedIntent: "list_products",
    expectedFilters: { minDaysToManufacture: 3 },
    implemented: true,
  },
  {
    id: "P081",
    question: "Products with safety stock equal to zero",
    expectedIntent: "count_products_zero_safety_stock",
    implemented: true,
  },
  {
    id: "P082",
    question: "Products with reorder point above 500",
    expectedIntent: "list_products",
    expectedFilters: { minReorderPoint: 500 },
    implemented: true,
  },

  // —— Backlog: model / line ——
  {
    id: "P083",
    question: "How many products per product model?",
    expectedIntent: "products_by_model",
    implemented: true,
  },
  {
    id: "P084",
    question: "List products for product line R",
    expectedIntent: "list_products",
    expectedFilters: { productLine: "R" },
    implemented: true,
  },
  {
    id: "P085",
    question: "Distinct product lines",
    expectedIntent: "list_product_lines",
    implemented: true,
  },

  // —— Paraphrases / edge wording (mix) ——
  {
    id: "P086",
    question: "Total products count please",
    expectedIntent: "count_products",
    implemented: true,
  },
  {
    id: "P087",
    question: "Products grouped by category with counts",
    expectedIntent: "products_by_category",
    implemented: true,
  },
  {
    id: "P088",
    question: "Break down products by color",
    expectedIntent: "products_by_color",
    implemented: true,
  },
  {
    id: "P089",
    question: "Mean list price across categories",
    expectedIntent: "avg_list_price_by_category",
    implemented: true,
    notes: "Intent exists; extend heuristic for 'mean' + 'across categories'",
  },
  {
    id: "P090",
    question: "Give me expensive bikes only top 3",
    expectedIntent: "top_expensive_products",
    expectedFilters: { limit: 3, category: "Bikes" },
    implemented: true,
  },

  // —— Negatives / out of product scope (expect no_match when classified) ——
  {
    id: "P091",
    question: "Delete all products",
    expectedIntent: "no_match",
    implemented: true,
    notes: "Must never become a write intent",
  },
  {
    id: "P092",
    question: "Update list price to 0 for all products",
    expectedIntent: "no_match",
    implemented: true,
  },
  {
    id: "P093",
    question: "asdf qwer product zxcv",
    expectedIntent: "no_match",
    implemented: true,
  },
  {
    id: "P094",
    question: "How many customers bought product 680?",
    expectedIntent: "no_match",
    implemented: true,
    notes: "Sales/customer — not product module",
  },
  {
    id: "P095",
    question: "What is the stock for product 680?",
    expectedIntent: "no_match",
    implemented: true,
    notes: "Inventory module later; product gold expects no_match for now",
  },

  // —— More list / compare backlog ——
  {
    id: "P096",
    question: "Compare average price of Bikes vs Clothing",
    expectedIntent: "compare_avg_price_categories",
    expectedFilters: { categories: ["Bikes", "Clothing"] },
    implemented: true,
  },
  {
    id: "P097",
    question: "Silver or black products under 100",
    expectedIntent: "list_products",
    expectedFilters: { colors: ["Black", "Silver"], maxPrice: 100 },
    implemented: true,
  },
  {
    id: "P098",
    question: "Products without a product model",
    expectedIntent: "count_products_without_model",
    implemented: true,
  },
  {
    id: "P099",
    question: "How many unique colors are used on products?",
    expectedIntent: "count_distinct_colors",
    implemented: true,
  },
  {
    id: "P100",
    question: "Show a random sample of 15 products",
    expectedIntent: "sample_products",
    expectedFilters: { limit: 15 },
    implemented: true,
  },
];

export const productQuestionStats = () => {
  const total = PRODUCT_QUESTION_CASES.length;
  const implemented = PRODUCT_QUESTION_CASES.filter((c) => c.implemented).length;
  return {
    total,
    implemented,
    backlog: total - implemented,
  };
}
