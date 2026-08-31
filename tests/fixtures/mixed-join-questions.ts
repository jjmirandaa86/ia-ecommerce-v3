/**
 * Gold set — mixed / internal joins across ecommerce tables (500 unique NL questions).
 * These questions intentionally span 2+ allowlisted tables
 * (product, sales, customer/contact, review, inventory, …).
 *
 * joinFamily  = pattern bucket for backlog planning
 * joinTables  = tables the answer SQL should touch
 * implemented = heuristic + SQL + format exist (tables/mixed or reused intent)
 *
 * Run: npm run test:mixed-join-questions
 */
export type MixedJoinQuestionCase = {
  id: string;
  question: string;
  expectedIntent: string;
  expectedFilters?: Record<string, unknown>;
  joinTables: string[];
  joinFamily: string;
  implemented: boolean;
  notes?: string;
};

export const MIXED_JOIN_QUESTION_CASES: MixedJoinQuestionCase[] =
[
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ001"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": true,
    "notes": "seed example — mixed join product×sales×customer",
    "id": "MJ002"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ003"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ004"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ005"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ006"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ007"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ008"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ009"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ010"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ011"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ012"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ013"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ014"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ015"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ016"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ017"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ018"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Baker",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ019"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Baker",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ020"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Baker",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ021"
  },
  {
    "question": "Give products name Tire that sales in last 1 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Foster",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ022"
  },
  {
    "question": "Give products name Tire that sales in last 2 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Foster",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ023"
  },
  {
    "question": "Give products name Tire that sales in last 3 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Foster",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ024"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ025"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ026"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ027"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ028"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ029"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ030"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ031"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ032"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ033"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ034"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ035"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ036"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ037"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ038"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ039"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ040"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ041"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ042"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Baker",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ043"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Baker",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ044"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Baker",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ045"
  },
  {
    "question": "Give products name Helmet that sales in last 1 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Foster",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ046"
  },
  {
    "question": "Give products name Helmet that sales in last 2 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Foster",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ047"
  },
  {
    "question": "Give products name Helmet that sales in last 3 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Foster",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ048"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ049"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ050"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ051"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ052"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ053"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ054"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ055"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ056"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ057"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ058"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ059"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ060"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ061"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ062"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ063"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ064"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ065"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ066"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Baker",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ067"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Baker",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ068"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Baker",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Baker",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ069"
  },
  {
    "question": "Give products name Pedal that sales in last 1 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Foster",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ070"
  },
  {
    "question": "Give products name Pedal that sales in last 2 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Foster",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ071"
  },
  {
    "question": "Give products name Pedal that sales in last 3 year and customer have names like Foster",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Foster",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ072"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ073"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ074"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like Miranda",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ075"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ076"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ077"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like Michelle",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ078"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ079"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ080"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like Adams",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ081"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ082"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ083"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like James",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ084"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ085"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ086"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like Lopez",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ087"
  },
  {
    "question": "Give products name Chain that sales in last 1 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ088"
  },
  {
    "question": "Give products name Chain that sales in last 2 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ089"
  },
  {
    "question": "Give products name Chain that sales in last 3 year and customer have names like Chen",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer",
    "implemented": false,
    "id": "MJ090"
  },
  {
    "question": "Which customers named like Miranda bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ091"
  },
  {
    "question": "Which customers named like Michelle bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ092"
  },
  {
    "question": "Which customers named like Adams bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ093"
  },
  {
    "question": "Which customers named like James bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ094"
  },
  {
    "question": "Which customers named like Lopez bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ095"
  },
  {
    "question": "Which customers named like Chen bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ096"
  },
  {
    "question": "Which customers named like Baker bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ097"
  },
  {
    "question": "Which customers named like Foster bought products named like Tire?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ098"
  },
  {
    "question": "Which customers named like Miranda bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ099"
  },
  {
    "question": "Which customers named like Michelle bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ100"
  },
  {
    "question": "Which customers named like Adams bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ101"
  },
  {
    "question": "Which customers named like James bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ102"
  },
  {
    "question": "Which customers named like Lopez bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ103"
  },
  {
    "question": "Which customers named like Chen bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ104"
  },
  {
    "question": "Which customers named like Baker bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ105"
  },
  {
    "question": "Which customers named like Foster bought products named like Helmet?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ106"
  },
  {
    "question": "Which customers named like Miranda bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ107"
  },
  {
    "question": "Which customers named like Michelle bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ108"
  },
  {
    "question": "Which customers named like Adams bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ109"
  },
  {
    "question": "Which customers named like James bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ110"
  },
  {
    "question": "Which customers named like Lopez bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ111"
  },
  {
    "question": "Which customers named like Chen bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ112"
  },
  {
    "question": "Which customers named like Baker bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ113"
  },
  {
    "question": "Which customers named like Foster bought products named like Pedal?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ114"
  },
  {
    "question": "Which customers named like Miranda bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ115"
  },
  {
    "question": "Which customers named like Michelle bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ116"
  },
  {
    "question": "Which customers named like Adams bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ117"
  },
  {
    "question": "Which customers named like James bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ118"
  },
  {
    "question": "Which customers named like Lopez bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ119"
  },
  {
    "question": "Which customers named like Chen bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ120"
  },
  {
    "question": "Which customers named like Baker bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ121"
  },
  {
    "question": "Which customers named like Foster bought products named like Chain?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ122"
  },
  {
    "question": "Which customers named like Miranda bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ123"
  },
  {
    "question": "Which customers named like Michelle bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ124"
  },
  {
    "question": "Which customers named like Adams bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ125"
  },
  {
    "question": "Which customers named like James bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ126"
  },
  {
    "question": "Which customers named like Lopez bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ127"
  },
  {
    "question": "Which customers named like Chen bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ128"
  },
  {
    "question": "Which customers named like Baker bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ129"
  },
  {
    "question": "Which customers named like Foster bought products named like Brake?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ130"
  },
  {
    "question": "Which customers named like Miranda bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ131"
  },
  {
    "question": "Which customers named like Michelle bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ132"
  },
  {
    "question": "Which customers named like Adams bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ133"
  },
  {
    "question": "Which customers named like James bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ134"
  },
  {
    "question": "Which customers named like Lopez bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ135"
  },
  {
    "question": "Which customers named like Chen bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ136"
  },
  {
    "question": "Which customers named like Baker bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ137"
  },
  {
    "question": "Which customers named like Foster bought products named like Wheel?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ138"
  },
  {
    "question": "Which customers named like Miranda bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ139"
  },
  {
    "question": "Which customers named like Michelle bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ140"
  },
  {
    "question": "Which customers named like Adams bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ141"
  },
  {
    "question": "Which customers named like James bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ142"
  },
  {
    "question": "Which customers named like Lopez bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Lopez"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ143"
  },
  {
    "question": "Which customers named like Chen bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Chen"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ144"
  },
  {
    "question": "Which customers named like Baker bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Baker"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ145"
  },
  {
    "question": "Which customers named like Foster bought products named like Frame?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "customerNameContains": "Foster"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ146"
  },
  {
    "question": "Which customers named like Miranda bought products named like Seat?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Seat",
      "customerNameContains": "Miranda"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ147"
  },
  {
    "question": "Which customers named like Michelle bought products named like Seat?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Seat",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ148"
  },
  {
    "question": "Which customers named like Adams bought products named like Seat?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Seat",
      "customerNameContains": "Adams"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ149"
  },
  {
    "question": "Which customers named like James bought products named like Seat?",
    "expectedIntent": "customers_who_bought_product_name",
    "expectedFilters": {
      "productNameContains": "Seat",
      "customerNameContains": "James"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ150"
  },
  {
    "question": "Top products in category Bikes by sales in the last 3 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 3,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ151"
  },
  {
    "question": "How much sales value did category Bikes generate in the last 3 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 3
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ152"
  },
  {
    "question": "Top products in category Bikes by sales in the last 6 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 6,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ153"
  },
  {
    "question": "How much sales value did category Bikes generate in the last 6 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 6
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ154"
  },
  {
    "question": "Top products in category Bikes by sales in the last 12 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 12,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ155"
  },
  {
    "question": "How much sales value did category Bikes generate in the last 12 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ156"
  },
  {
    "question": "Top products in category Bikes by sales in the last 24 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 24,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ157"
  },
  {
    "question": "How much sales value did category Bikes generate in the last 24 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ158"
  },
  {
    "question": "Top products in category Bikes by sales in the last 36 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 36,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ159"
  },
  {
    "question": "How much sales value did category Bikes generate in the last 36 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Bikes",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ160"
  },
  {
    "question": "Top products in category Components by sales in the last 3 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 3,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ161"
  },
  {
    "question": "How much sales value did category Components generate in the last 3 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 3
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ162"
  },
  {
    "question": "Top products in category Components by sales in the last 6 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 6,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ163"
  },
  {
    "question": "How much sales value did category Components generate in the last 6 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 6
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ164"
  },
  {
    "question": "Top products in category Components by sales in the last 12 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 12,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ165"
  },
  {
    "question": "How much sales value did category Components generate in the last 12 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ166"
  },
  {
    "question": "Top products in category Components by sales in the last 24 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 24,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ167"
  },
  {
    "question": "How much sales value did category Components generate in the last 24 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ168"
  },
  {
    "question": "Top products in category Components by sales in the last 36 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 36,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ169"
  },
  {
    "question": "How much sales value did category Components generate in the last 36 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Components",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ170"
  },
  {
    "question": "Top products in category Clothing by sales in the last 3 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 3,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ171"
  },
  {
    "question": "How much sales value did category Clothing generate in the last 3 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 3
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ172"
  },
  {
    "question": "Top products in category Clothing by sales in the last 6 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 6,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ173"
  },
  {
    "question": "How much sales value did category Clothing generate in the last 6 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 6
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ174"
  },
  {
    "question": "Top products in category Clothing by sales in the last 12 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 12,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ175"
  },
  {
    "question": "How much sales value did category Clothing generate in the last 12 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ176"
  },
  {
    "question": "Top products in category Clothing by sales in the last 24 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 24,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ177"
  },
  {
    "question": "How much sales value did category Clothing generate in the last 24 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ178"
  },
  {
    "question": "Top products in category Clothing by sales in the last 36 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 36,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ179"
  },
  {
    "question": "How much sales value did category Clothing generate in the last 36 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Clothing",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ180"
  },
  {
    "question": "Top products in category Accessories by sales in the last 3 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 3,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ181"
  },
  {
    "question": "How much sales value did category Accessories generate in the last 3 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 3
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ182"
  },
  {
    "question": "Top products in category Accessories by sales in the last 6 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 6,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ183"
  },
  {
    "question": "How much sales value did category Accessories generate in the last 6 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 6
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ184"
  },
  {
    "question": "Top products in category Accessories by sales in the last 12 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 12,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ185"
  },
  {
    "question": "How much sales value did category Accessories generate in the last 12 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ186"
  },
  {
    "question": "Top products in category Accessories by sales in the last 24 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 24,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ187"
  },
  {
    "question": "How much sales value did category Accessories generate in the last 24 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ188"
  },
  {
    "question": "Top products in category Accessories by sales in the last 36 months",
    "expectedIntent": "top_products_by_category_sales_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 36,
      "limit": 10
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ189"
  },
  {
    "question": "How much sales value did category Accessories generate in the last 36 months?",
    "expectedIntent": "sum_sales_by_category_period",
    "expectedFilters": {
      "category": "Accessories",
      "lastMonths": 36
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ190"
  },
  {
    "question": "Sales of subcategory Mountain Bikes in the last 1 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Mountain Bikes",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ191"
  },
  {
    "question": "Sales of subcategory Mountain Bikes in the last 2 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Mountain Bikes",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ192"
  },
  {
    "question": "Sales of subcategory Road Bikes in the last 1 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Road Bikes",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ193"
  },
  {
    "question": "Sales of subcategory Road Bikes in the last 2 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Road Bikes",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ194"
  },
  {
    "question": "Sales of subcategory Helmets in the last 1 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Helmets",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ195"
  },
  {
    "question": "Sales of subcategory Helmets in the last 2 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Helmets",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ196"
  },
  {
    "question": "Sales of subcategory Gloves in the last 1 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Gloves",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ197"
  },
  {
    "question": "Sales of subcategory Gloves in the last 2 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Gloves",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ198"
  },
  {
    "question": "Sales of subcategory Tires and Tubes in the last 1 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Tires and Tubes",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ199"
  },
  {
    "question": "Sales of subcategory Tires and Tubes in the last 2 year",
    "expectedIntent": "sum_sales_by_subcategory_period",
    "expectedFilters": {
      "subcategory": "Tires and Tubes",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_category_sales",
    "implemented": false,
    "id": "MJ200"
  },
  {
    "question": "Sales of Black products to store customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Black",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ201"
  },
  {
    "question": "How many Black products were bought by store customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Black",
      "customerType": "S",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ202"
  },
  {
    "question": "Sales of Black products to individual customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Black",
      "customerType": "I"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ203"
  },
  {
    "question": "How many Black products were bought by individual customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Black",
      "customerType": "I",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ204"
  },
  {
    "question": "Sales of Red products to store customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Red",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ205"
  },
  {
    "question": "How many Red products were bought by store customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Red",
      "customerType": "S",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ206"
  },
  {
    "question": "Sales of Red products to individual customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Red",
      "customerType": "I"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ207"
  },
  {
    "question": "How many Red products were bought by individual customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Red",
      "customerType": "I",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ208"
  },
  {
    "question": "Sales of Blue products to store customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Blue",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ209"
  },
  {
    "question": "How many Blue products were bought by store customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Blue",
      "customerType": "S",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ210"
  },
  {
    "question": "Sales of Blue products to individual customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Blue",
      "customerType": "I"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ211"
  },
  {
    "question": "How many Blue products were bought by individual customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Blue",
      "customerType": "I",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ212"
  },
  {
    "question": "Sales of Silver products to store customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Silver",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ213"
  },
  {
    "question": "How many Silver products were bought by store customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Silver",
      "customerType": "S",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ214"
  },
  {
    "question": "Sales of Silver products to individual customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Silver",
      "customerType": "I"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ215"
  },
  {
    "question": "How many Silver products were bought by individual customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Silver",
      "customerType": "I",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ216"
  },
  {
    "question": "Sales of Yellow products to store customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Yellow",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ217"
  },
  {
    "question": "How many Yellow products were bought by store customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Yellow",
      "customerType": "S",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ218"
  },
  {
    "question": "Sales of Yellow products to individual customers",
    "expectedIntent": "sales_by_product_color_and_customer_type",
    "expectedFilters": {
      "color": "Yellow",
      "customerType": "I"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ219"
  },
  {
    "question": "How many Yellow products were bought by individual customers in the last 12 months?",
    "expectedIntent": "count_sales_by_product_color_and_customer_type_period",
    "expectedFilters": {
      "color": "Yellow",
      "customerType": "I",
      "lastMonths": 12
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ220"
  },
  {
    "question": "Products named like Tire with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Tire",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ221"
  },
  {
    "question": "Products named like Tire with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Tire",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ222"
  },
  {
    "question": "Products named like Tire with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Tire",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ223"
  },
  {
    "question": "Products named like Tire with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Tire",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ224"
  },
  {
    "question": "Products named like Tire with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Tire",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ225"
  },
  {
    "question": "Average review rating for products named like Tire",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Tire"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ226"
  },
  {
    "question": "Products named like Helmet with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ227"
  },
  {
    "question": "Products named like Helmet with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ228"
  },
  {
    "question": "Products named like Helmet with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ229"
  },
  {
    "question": "Products named like Helmet with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ230"
  },
  {
    "question": "Products named like Helmet with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ231"
  },
  {
    "question": "Average review rating for products named like Helmet",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ232"
  },
  {
    "question": "Products named like Pedal with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ233"
  },
  {
    "question": "Products named like Pedal with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ234"
  },
  {
    "question": "Products named like Pedal with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ235"
  },
  {
    "question": "Products named like Pedal with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ236"
  },
  {
    "question": "Products named like Pedal with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ237"
  },
  {
    "question": "Average review rating for products named like Pedal",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ238"
  },
  {
    "question": "Products named like Chain with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Chain",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ239"
  },
  {
    "question": "Products named like Chain with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Chain",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ240"
  },
  {
    "question": "Products named like Chain with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Chain",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ241"
  },
  {
    "question": "Products named like Chain with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Chain",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ242"
  },
  {
    "question": "Products named like Chain with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Chain",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ243"
  },
  {
    "question": "Average review rating for products named like Chain",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Chain"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ244"
  },
  {
    "question": "Products named like Brake with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Brake",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ245"
  },
  {
    "question": "Products named like Brake with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Brake",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ246"
  },
  {
    "question": "Products named like Brake with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Brake",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ247"
  },
  {
    "question": "Products named like Brake with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Brake",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ248"
  },
  {
    "question": "Products named like Brake with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Brake",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ249"
  },
  {
    "question": "Average review rating for products named like Brake",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Brake"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ250"
  },
  {
    "question": "Products named like Wheel with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ251"
  },
  {
    "question": "Products named like Wheel with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ252"
  },
  {
    "question": "Products named like Wheel with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ253"
  },
  {
    "question": "Products named like Wheel with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ254"
  },
  {
    "question": "Products named like Wheel with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ255"
  },
  {
    "question": "Average review rating for products named like Wheel",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ256"
  },
  {
    "question": "Products named like Frame with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Frame",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ257"
  },
  {
    "question": "Products named like Frame with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Frame",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ258"
  },
  {
    "question": "Products named like Frame with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Frame",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ259"
  },
  {
    "question": "Products named like Frame with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Frame",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ260"
  },
  {
    "question": "Products named like Frame with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Frame",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ261"
  },
  {
    "question": "Average review rating for products named like Frame",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Frame"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ262"
  },
  {
    "question": "Products named like Seat with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Seat",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ263"
  },
  {
    "question": "Products named like Seat with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Seat",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ264"
  },
  {
    "question": "Products named like Seat with review rating 3",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Seat",
      "rating": 3
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ265"
  },
  {
    "question": "Products named like Seat with review rating 4",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Seat",
      "rating": 4
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ266"
  },
  {
    "question": "Products named like Seat with review rating 5",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Seat",
      "rating": 5
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ267"
  },
  {
    "question": "Average review rating for products named like Seat",
    "expectedIntent": "avg_review_rating_for_product_name",
    "expectedFilters": {
      "productNameContains": "Seat"
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ268"
  },
  {
    "question": "Products named like Fork with review rating 1",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Fork",
      "rating": 1
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ269"
  },
  {
    "question": "Products named like Fork with review rating 2",
    "expectedIntent": "products_by_name_and_review_rating",
    "expectedFilters": {
      "productNameContains": "Fork",
      "rating": 2
    },
    "joinTables": [
      "product",
      "productreview"
    ],
    "joinFamily": "product_review",
    "implemented": false,
    "id": "MJ270"
  },
  {
    "question": "Stock quantity for products named like Tire",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Tire"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ271"
  },
  {
    "question": "Total inventory of product Tire across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Tire"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ272"
  },
  {
    "question": "Stock quantity for products named like Helmet",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ273"
  },
  {
    "question": "Total inventory of product Helmet across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ274"
  },
  {
    "question": "Stock quantity for products named like Pedal",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ275"
  },
  {
    "question": "Total inventory of product Pedal across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ276"
  },
  {
    "question": "Stock quantity for products named like Chain",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Chain"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ277"
  },
  {
    "question": "Total inventory of product Chain across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Chain"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ278"
  },
  {
    "question": "Stock quantity for products named like Brake",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Brake"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ279"
  },
  {
    "question": "Total inventory of product Brake across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Brake"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ280"
  },
  {
    "question": "Stock quantity for products named like Wheel",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ281"
  },
  {
    "question": "Total inventory of product Wheel across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ282"
  },
  {
    "question": "Stock quantity for products named like Frame",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Frame"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ283"
  },
  {
    "question": "Total inventory of product Frame across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Frame"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ284"
  },
  {
    "question": "Stock quantity for products named like Seat",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Seat"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ285"
  },
  {
    "question": "Total inventory of product Seat across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Seat"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ286"
  },
  {
    "question": "Stock quantity for products named like Fork",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Fork"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ287"
  },
  {
    "question": "Total inventory of product Fork across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Fork"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ288"
  },
  {
    "question": "Stock quantity for products named like Jersey",
    "expectedIntent": "inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Jersey"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ289"
  },
  {
    "question": "Total inventory of product Jersey across locations",
    "expectedIntent": "sum_inventory_for_product_name",
    "expectedFilters": {
      "productNameContains": "Jersey"
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ290"
  },
  {
    "question": "Inventory for product 680 by location",
    "expectedIntent": "inventory_by_product_id",
    "expectedFilters": {
      "productId": 680
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "id": "MJ291"
  },
  {
    "question": "Inventory for product 707 by location",
    "expectedIntent": "inventory_by_product_id",
    "expectedFilters": {
      "productId": 707
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "id": "MJ292"
  },
  {
    "question": "Inventory for product 771 by location",
    "expectedIntent": "inventory_by_product_id",
    "expectedFilters": {
      "productId": 771
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "id": "MJ293"
  },
  {
    "question": "Inventory for product 870 by location",
    "expectedIntent": "inventory_by_product_id",
    "expectedFilters": {
      "productId": 870
    },
    "joinTables": [
      "product",
      "productinventory"
    ],
    "joinFamily": "product_inventory",
    "implemented": false,
    "id": "MJ294"
  },
  {
    "question": "Orders for customers with name like Miranda in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": true,
    "id": "MJ295"
  },
  {
    "question": "Total sales value for customers named like Miranda over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ296"
  },
  {
    "question": "Orders for customers with name like Miranda in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ297"
  },
  {
    "question": "Total sales value for customers named like Miranda over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ298"
  },
  {
    "question": "Orders for customers with name like Miranda in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ299"
  },
  {
    "question": "Total sales value for customers named like Miranda over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Miranda",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ300"
  },
  {
    "question": "Email and phone of customers named like Miranda who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Miranda"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ301"
  },
  {
    "question": "Orders for customers with name like Michelle in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ302"
  },
  {
    "question": "Total sales value for customers named like Michelle over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ303"
  },
  {
    "question": "Orders for customers with name like Michelle in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ304"
  },
  {
    "question": "Total sales value for customers named like Michelle over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ305"
  },
  {
    "question": "Orders for customers with name like Michelle in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ306"
  },
  {
    "question": "Total sales value for customers named like Michelle over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Michelle",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ307"
  },
  {
    "question": "Email and phone of customers named like Michelle who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Michelle"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ308"
  },
  {
    "question": "Orders for customers with name like Adams in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ309"
  },
  {
    "question": "Total sales value for customers named like Adams over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ310"
  },
  {
    "question": "Orders for customers with name like Adams in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ311"
  },
  {
    "question": "Total sales value for customers named like Adams over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ312"
  },
  {
    "question": "Orders for customers with name like Adams in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ313"
  },
  {
    "question": "Total sales value for customers named like Adams over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Adams",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ314"
  },
  {
    "question": "Email and phone of customers named like Adams who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Adams"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ315"
  },
  {
    "question": "Orders for customers with name like James in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ316"
  },
  {
    "question": "Total sales value for customers named like James over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ317"
  },
  {
    "question": "Orders for customers with name like James in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ318"
  },
  {
    "question": "Total sales value for customers named like James over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ319"
  },
  {
    "question": "Orders for customers with name like James in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ320"
  },
  {
    "question": "Total sales value for customers named like James over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "James",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ321"
  },
  {
    "question": "Email and phone of customers named like James who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "James"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ322"
  },
  {
    "question": "Orders for customers with name like Lopez in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ323"
  },
  {
    "question": "Total sales value for customers named like Lopez over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ324"
  },
  {
    "question": "Orders for customers with name like Lopez in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ325"
  },
  {
    "question": "Total sales value for customers named like Lopez over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ326"
  },
  {
    "question": "Orders for customers with name like Lopez in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ327"
  },
  {
    "question": "Total sales value for customers named like Lopez over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Lopez",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ328"
  },
  {
    "question": "Email and phone of customers named like Lopez who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Lopez"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ329"
  },
  {
    "question": "Orders for customers with name like Chen in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ330"
  },
  {
    "question": "Total sales value for customers named like Chen over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ331"
  },
  {
    "question": "Orders for customers with name like Chen in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ332"
  },
  {
    "question": "Total sales value for customers named like Chen over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ333"
  },
  {
    "question": "Orders for customers with name like Chen in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ334"
  },
  {
    "question": "Total sales value for customers named like Chen over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Chen",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ335"
  },
  {
    "question": "Email and phone of customers named like Chen who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Chen"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ336"
  },
  {
    "question": "Orders for customers with name like Baker in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ337"
  },
  {
    "question": "Total sales value for customers named like Baker over the last 12 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ338"
  },
  {
    "question": "Orders for customers with name like Baker in the last 24 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ339"
  },
  {
    "question": "Total sales value for customers named like Baker over the last 24 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 24
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ340"
  },
  {
    "question": "Orders for customers with name like Baker in the last 36 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ341"
  },
  {
    "question": "Total sales value for customers named like Baker over the last 36 months",
    "expectedIntent": "sum_sales_for_customers_by_name_period",
    "expectedFilters": {
      "nameContains": "Baker",
      "lastMonths": 36
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ342"
  },
  {
    "question": "Email and phone of customers named like Baker who have orders",
    "expectedIntent": "contact_of_customers_with_orders_by_name",
    "expectedFilters": {
      "nameContains": "Baker"
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ343"
  },
  {
    "question": "Orders for customers with name like Foster in the last 12 months",
    "expectedIntent": "orders_for_customers_by_name",
    "expectedFilters": {
      "nameContains": "Foster",
      "lastMonths": 12
    },
    "joinTables": [
      "customer",
      "individual",
      "contact",
      "salesorderheader"
    ],
    "joinFamily": "customer_sales",
    "implemented": false,
    "id": "MJ344"
  },
  {
    "question": "Sales of category Bikes to customers in territory 1",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ345"
  },
  {
    "question": "How many orders of Bikes products from territory 1?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ346"
  },
  {
    "question": "Sales of category Components to customers in territory 1",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ347"
  },
  {
    "question": "How many orders of Components products from territory 1?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ348"
  },
  {
    "question": "Sales of category Clothing to customers in territory 1",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ349"
  },
  {
    "question": "How many orders of Clothing products from territory 1?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ350"
  },
  {
    "question": "Sales of category Accessories to customers in territory 1",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ351"
  },
  {
    "question": "How many orders of Accessories products from territory 1?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 1
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ352"
  },
  {
    "question": "Sales of category Bikes to customers in territory 4",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ353"
  },
  {
    "question": "How many orders of Bikes products from territory 4?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ354"
  },
  {
    "question": "Sales of category Components to customers in territory 4",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ355"
  },
  {
    "question": "How many orders of Components products from territory 4?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ356"
  },
  {
    "question": "Sales of category Clothing to customers in territory 4",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ357"
  },
  {
    "question": "How many orders of Clothing products from territory 4?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ358"
  },
  {
    "question": "Sales of category Accessories to customers in territory 4",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ359"
  },
  {
    "question": "How many orders of Accessories products from territory 4?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 4
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ360"
  },
  {
    "question": "Sales of category Bikes to customers in territory 6",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ361"
  },
  {
    "question": "How many orders of Bikes products from territory 6?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ362"
  },
  {
    "question": "Sales of category Components to customers in territory 6",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ363"
  },
  {
    "question": "How many orders of Components products from territory 6?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ364"
  },
  {
    "question": "Sales of category Clothing to customers in territory 6",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ365"
  },
  {
    "question": "How many orders of Clothing products from territory 6?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ366"
  },
  {
    "question": "Sales of category Accessories to customers in territory 6",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ367"
  },
  {
    "question": "How many orders of Accessories products from territory 6?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 6
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ368"
  },
  {
    "question": "Sales of category Bikes to customers in territory 9",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ369"
  },
  {
    "question": "How many orders of Bikes products from territory 9?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Bikes",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ370"
  },
  {
    "question": "Sales of category Components to customers in territory 9",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ371"
  },
  {
    "question": "How many orders of Components products from territory 9?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Components",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ372"
  },
  {
    "question": "Sales of category Clothing to customers in territory 9",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ373"
  },
  {
    "question": "How many orders of Clothing products from territory 9?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Clothing",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ374"
  },
  {
    "question": "Sales of category Accessories to customers in territory 9",
    "expectedIntent": "sales_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ375"
  },
  {
    "question": "How many orders of Accessories products from territory 9?",
    "expectedIntent": "count_orders_by_category_and_territory",
    "expectedFilters": {
      "category": "Accessories",
      "territoryId": 9
    },
    "joinTables": [
      "customer",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "territory_category_sales",
    "implemented": false,
    "id": "MJ376"
  },
  {
    "question": "Reviews with rating 1 for products in category Bikes",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 1,
      "category": "Bikes"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ377"
  },
  {
    "question": "Reviews with rating 2 for products in category Bikes",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 2,
      "category": "Bikes"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ378"
  },
  {
    "question": "Reviews with rating 5 for products in category Bikes",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 5,
      "category": "Bikes"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ379"
  },
  {
    "question": "Average rating of products in category Bikes",
    "expectedIntent": "avg_review_rating_by_category",
    "expectedFilters": {
      "category": "Bikes"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ380"
  },
  {
    "question": "Reviews with rating 1 for products in category Components",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 1,
      "category": "Components"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ381"
  },
  {
    "question": "Reviews with rating 2 for products in category Components",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 2,
      "category": "Components"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ382"
  },
  {
    "question": "Reviews with rating 5 for products in category Components",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 5,
      "category": "Components"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ383"
  },
  {
    "question": "Average rating of products in category Components",
    "expectedIntent": "avg_review_rating_by_category",
    "expectedFilters": {
      "category": "Components"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ384"
  },
  {
    "question": "Reviews with rating 1 for products in category Clothing",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 1,
      "category": "Clothing"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ385"
  },
  {
    "question": "Reviews with rating 2 for products in category Clothing",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 2,
      "category": "Clothing"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ386"
  },
  {
    "question": "Reviews with rating 5 for products in category Clothing",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 5,
      "category": "Clothing"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ387"
  },
  {
    "question": "Average rating of products in category Clothing",
    "expectedIntent": "avg_review_rating_by_category",
    "expectedFilters": {
      "category": "Clothing"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ388"
  },
  {
    "question": "Reviews with rating 1 for products in category Accessories",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 1,
      "category": "Accessories"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ389"
  },
  {
    "question": "Reviews with rating 2 for products in category Accessories",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 2,
      "category": "Accessories"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ390"
  },
  {
    "question": "Reviews with rating 5 for products in category Accessories",
    "expectedIntent": "reviews_by_rating_and_category",
    "expectedFilters": {
      "rating": 5,
      "category": "Accessories"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ391"
  },
  {
    "question": "Average rating of products in category Accessories",
    "expectedIntent": "avg_review_rating_by_category",
    "expectedFilters": {
      "category": "Accessories"
    },
    "joinTables": [
      "productreview",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "review_category",
    "implemented": false,
    "id": "MJ392"
  },
  {
    "question": "List price and quantity sold for products like Tire",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Tire"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ393"
  },
  {
    "question": "Units sold of Tire products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Tire",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ394"
  },
  {
    "question": "List price and quantity sold for products like Helmet",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ395"
  },
  {
    "question": "Units sold of Helmet products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ396"
  },
  {
    "question": "List price and quantity sold for products like Pedal",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ397"
  },
  {
    "question": "Units sold of Pedal products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ398"
  },
  {
    "question": "List price and quantity sold for products like Chain",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Chain"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ399"
  },
  {
    "question": "Units sold of Chain products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Chain",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ400"
  },
  {
    "question": "List price and quantity sold for products like Brake",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Brake"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ401"
  },
  {
    "question": "Units sold of Brake products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Brake",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ402"
  },
  {
    "question": "List price and quantity sold for products like Wheel",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ403"
  },
  {
    "question": "Units sold of Wheel products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ404"
  },
  {
    "question": "List price and quantity sold for products like Frame",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Frame"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ405"
  },
  {
    "question": "Units sold of Frame products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Frame",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ406"
  },
  {
    "question": "List price and quantity sold for products like Seat",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Seat"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ407"
  },
  {
    "question": "Units sold of Seat products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Seat",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ408"
  },
  {
    "question": "List price and quantity sold for products like Fork",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Fork"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ409"
  },
  {
    "question": "Units sold of Fork products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Fork",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ410"
  },
  {
    "question": "List price and quantity sold for products like Jersey",
    "expectedIntent": "price_and_qty_sold_for_product_name",
    "expectedFilters": {
      "productNameContains": "Jersey"
    },
    "joinTables": [
      "product",
      "salesorderdetail"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ411"
  },
  {
    "question": "Units sold of Jersey products in the last 24 months",
    "expectedIntent": "sum_qty_sold_for_product_name_period",
    "expectedFilters": {
      "productNameContains": "Jersey",
      "lastMonths": 24
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader"
    ],
    "joinFamily": "product_sales_qty",
    "implemented": false,
    "id": "MJ412"
  },
  {
    "question": "Did customer 11000 buy product 680?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ413"
  },
  {
    "question": "Orders where customer 11000 purchased product 680",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ414"
  },
  {
    "question": "Did customer 11000 buy product 707?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ415"
  },
  {
    "question": "Orders where customer 11000 purchased product 707",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ416"
  },
  {
    "question": "Did customer 11000 buy product 771?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ417"
  },
  {
    "question": "Orders where customer 11000 purchased product 771",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ418"
  },
  {
    "question": "Did customer 11000 buy product 870?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ419"
  },
  {
    "question": "Orders where customer 11000 purchased product 870",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 11000,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ420"
  },
  {
    "question": "Did customer 14340 buy product 680?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ421"
  },
  {
    "question": "Orders where customer 14340 purchased product 680",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ422"
  },
  {
    "question": "Did customer 14340 buy product 707?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ423"
  },
  {
    "question": "Orders where customer 14340 purchased product 707",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ424"
  },
  {
    "question": "Did customer 14340 buy product 771?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ425"
  },
  {
    "question": "Orders where customer 14340 purchased product 771",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ426"
  },
  {
    "question": "Did customer 14340 buy product 870?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ427"
  },
  {
    "question": "Orders where customer 14340 purchased product 870",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 14340,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ428"
  },
  {
    "question": "Did customer 26235 buy product 680?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ429"
  },
  {
    "question": "Orders where customer 26235 purchased product 680",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 680
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ430"
  },
  {
    "question": "Did customer 26235 buy product 707?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ431"
  },
  {
    "question": "Orders where customer 26235 purchased product 707",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 707
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ432"
  },
  {
    "question": "Did customer 26235 buy product 771?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ433"
  },
  {
    "question": "Orders where customer 26235 purchased product 771",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 771
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ434"
  },
  {
    "question": "Did customer 26235 buy product 870?",
    "expectedIntent": "customer_bought_product_id",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product",
      "customer"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ435"
  },
  {
    "question": "Orders where customer 26235 purchased product 870",
    "expectedIntent": "orders_for_customer_and_product",
    "expectedFilters": {
      "customerId": 26235,
      "productId": 870
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "customer",
      "product"
    ],
    "joinFamily": "customer_product_id",
    "implemented": false,
    "id": "MJ436"
  },
  {
    "question": "Orders with status 1 for customers named like Miranda",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Miranda"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ437"
  },
  {
    "question": "Orders with status 1 for customers named like Michelle",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Michelle"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ438"
  },
  {
    "question": "Orders with status 1 for customers named like Adams",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Adams"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ439"
  },
  {
    "question": "Orders with status 1 for customers named like James",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "James"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ440"
  },
  {
    "question": "Orders with status 1 for customers named like Lopez",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Lopez"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ441"
  },
  {
    "question": "Orders with status 1 for customers named like Chen",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Chen"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ442"
  },
  {
    "question": "Orders with status 1 for customers named like Baker",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Baker"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ443"
  },
  {
    "question": "Orders with status 1 for customers named like Foster",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 1,
      "nameContains": "Foster"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ444"
  },
  {
    "question": "Orders with status 5 for customers named like Miranda",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Miranda"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ445"
  },
  {
    "question": "Orders with status 5 for customers named like Michelle",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Michelle"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ446"
  },
  {
    "question": "Orders with status 5 for customers named like Adams",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Adams"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ447"
  },
  {
    "question": "Orders with status 5 for customers named like James",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "James"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ448"
  },
  {
    "question": "Orders with status 5 for customers named like Lopez",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Lopez"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ449"
  },
  {
    "question": "Orders with status 5 for customers named like Chen",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Chen"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ450"
  },
  {
    "question": "Orders with status 5 for customers named like Baker",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Baker"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ451"
  },
  {
    "question": "Orders with status 5 for customers named like Foster",
    "expectedIntent": "orders_by_status_and_customer_name",
    "expectedFilters": {
      "status": 5,
      "nameContains": "Foster"
    },
    "joinTables": [
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "order_status_customer",
    "implemented": false,
    "id": "MJ452"
  },
  {
    "question": "Online orders that include products like Tire",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Tire",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ453"
  },
  {
    "question": "Online orders that include products like Helmet",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ454"
  },
  {
    "question": "Online orders that include products like Pedal",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ455"
  },
  {
    "question": "Online orders that include products like Chain",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Chain",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ456"
  },
  {
    "question": "Online orders that include products like Brake",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Brake",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ457"
  },
  {
    "question": "Online orders that include products like Wheel",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Wheel",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ458"
  },
  {
    "question": "Online orders that include products like Frame",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Frame",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ459"
  },
  {
    "question": "Online orders that include products like Seat",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Seat",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ460"
  },
  {
    "question": "Online orders that include products like Fork",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Fork",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ461"
  },
  {
    "question": "Online orders that include products like Jersey",
    "expectedIntent": "online_orders_for_product_name",
    "expectedFilters": {
      "productNameContains": "Jersey",
      "onlineOrderFlag": true
    },
    "joinTables": [
      "salesorderheader",
      "salesorderdetail",
      "product"
    ],
    "joinFamily": "online_product",
    "implemented": false,
    "id": "MJ462"
  },
  {
    "question": "Total stock for products in category Bikes",
    "expectedIntent": "sum_inventory_by_category",
    "expectedFilters": {
      "category": "Bikes"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ463"
  },
  {
    "question": "Locations holding stock for category Bikes",
    "expectedIntent": "inventory_locations_by_category",
    "expectedFilters": {
      "category": "Bikes"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ464"
  },
  {
    "question": "Total stock for products in category Components",
    "expectedIntent": "sum_inventory_by_category",
    "expectedFilters": {
      "category": "Components"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ465"
  },
  {
    "question": "Locations holding stock for category Components",
    "expectedIntent": "inventory_locations_by_category",
    "expectedFilters": {
      "category": "Components"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ466"
  },
  {
    "question": "Total stock for products in category Clothing",
    "expectedIntent": "sum_inventory_by_category",
    "expectedFilters": {
      "category": "Clothing"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ467"
  },
  {
    "question": "Locations holding stock for category Clothing",
    "expectedIntent": "inventory_locations_by_category",
    "expectedFilters": {
      "category": "Clothing"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ468"
  },
  {
    "question": "Total stock for products in category Accessories",
    "expectedIntent": "sum_inventory_by_category",
    "expectedFilters": {
      "category": "Accessories"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ469"
  },
  {
    "question": "Locations holding stock for category Accessories",
    "expectedIntent": "inventory_locations_by_category",
    "expectedFilters": {
      "category": "Accessories"
    },
    "joinTables": [
      "productinventory",
      "product",
      "productsubcategory",
      "productcategory"
    ],
    "joinFamily": "inventory_category",
    "implemented": false,
    "notes": "productinventory module TODO",
    "id": "MJ470"
  },
  {
    "question": "Reviews by reviewer like Miranda on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Miranda",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ471"
  },
  {
    "question": "Reviews by reviewer like Miranda on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Miranda",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ472"
  },
  {
    "question": "Reviews by reviewer like Miranda on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Miranda",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ473"
  },
  {
    "question": "Reviews by reviewer like Michelle on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Michelle",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ474"
  },
  {
    "question": "Reviews by reviewer like Michelle on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Michelle",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ475"
  },
  {
    "question": "Reviews by reviewer like Michelle on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Michelle",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ476"
  },
  {
    "question": "Reviews by reviewer like Adams on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Adams",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ477"
  },
  {
    "question": "Reviews by reviewer like Adams on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Adams",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ478"
  },
  {
    "question": "Reviews by reviewer like Adams on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Adams",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ479"
  },
  {
    "question": "Reviews by reviewer like James on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "James",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ480"
  },
  {
    "question": "Reviews by reviewer like James on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "James",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ481"
  },
  {
    "question": "Reviews by reviewer like James on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "James",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ482"
  },
  {
    "question": "Reviews by reviewer like Lopez on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Lopez",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ483"
  },
  {
    "question": "Reviews by reviewer like Lopez on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Lopez",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ484"
  },
  {
    "question": "Reviews by reviewer like Lopez on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Lopez",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ485"
  },
  {
    "question": "Reviews by reviewer like Chen on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Chen",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ486"
  },
  {
    "question": "Reviews by reviewer like Chen on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Chen",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ487"
  },
  {
    "question": "Reviews by reviewer like Chen on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Chen",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ488"
  },
  {
    "question": "Reviews by reviewer like Baker on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Baker",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ489"
  },
  {
    "question": "Reviews by reviewer like Baker on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Baker",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ490"
  },
  {
    "question": "Reviews by reviewer like Baker on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Baker",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ491"
  },
  {
    "question": "Reviews by reviewer like Foster on products like Tire",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Foster",
      "productNameContains": "Tire"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ492"
  },
  {
    "question": "Reviews by reviewer like Foster on products like Helmet",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Foster",
      "productNameContains": "Helmet"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ493"
  },
  {
    "question": "Reviews by reviewer like Foster on products like Pedal",
    "expectedIntent": "reviews_by_reviewer_and_product_name",
    "expectedFilters": {
      "reviewerContains": "Foster",
      "productNameContains": "Pedal"
    },
    "joinTables": [
      "productreview",
      "product"
    ],
    "joinFamily": "review_product_reviewer",
    "implemented": false,
    "id": "MJ494"
  },
  {
    "question": "Find Helmet product sales linked to customer Michelle last 6 months with category Components",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle",
      "lastMonths": 6,
      "category": "Components"
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer_category",
    "implemented": false,
    "id": "MJ495"
  },
  {
    "question": "Mixed join: Red Helmet sold to Michelle customers in territory 4",
    "expectedIntent": "sales_by_product_color_customer_name_territory",
    "expectedFilters": {
      "color": "Red",
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle",
      "territoryId": 4
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "mixed_multi",
    "implemented": false,
    "id": "MJ496"
  },
  {
    "question": "Cross-table: list Helmet and contact email for buyers named Michelle",
    "expectedIntent": "product_and_buyer_email_by_names",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "customerNameContains": "Michelle"
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_customer",
    "implemented": false,
    "id": "MJ497"
  },
  {
    "question": "Join sales and reviews: products like Helmet sold last 6 months that have ratings",
    "expectedIntent": "sold_products_with_reviews_period",
    "expectedFilters": {
      "productNameContains": "Helmet",
      "lastMonths": 6
    },
    "joinTables": [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "productreview"
    ],
    "joinFamily": "sales_review",
    "implemented": false,
    "id": "MJ498"
  },
  {
    "question": "Internal join mix 1: subcategory sales of Road Bikes to store customers",
    "expectedIntent": "subcategory_sales_to_store_customers",
    "expectedFilters": {
      "subcategory": "Road Bikes",
      "customerType": "S"
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "salesorderdetail",
      "salesorderheader",
      "customer"
    ],
    "joinFamily": "product_customer_type",
    "implemented": false,
    "id": "MJ499"
  },
  {
    "question": "Find Pedal product sales linked to customer Adams last 12 months with category Clothing",
    "expectedIntent": "products_sold_to_named_customers",
    "expectedFilters": {
      "productNameContains": "Pedal",
      "customerNameContains": "Adams",
      "lastMonths": 12,
      "category": "Clothing"
    },
    "joinTables": [
      "product",
      "productsubcategory",
      "productcategory",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact"
    ],
    "joinFamily": "product_sales_customer_category",
    "implemented": false,
    "id": "MJ500"
  }
];

export function mixedJoinQuestionStats() {
  const total = MIXED_JOIN_QUESTION_CASES.length;
  const implemented = MIXED_JOIN_QUESTION_CASES.filter((c) => c.implemented).length;
  const byFamily: Record<string, number> = {};
  for (const c of MIXED_JOIN_QUESTION_CASES) {
    byFamily[c.joinFamily] = (byFamily[c.joinFamily] ?? 0) + 1;
  }
  return {
    total,
    implemented,
    backlog: total - implemented,
    byFamily,
  };
}
