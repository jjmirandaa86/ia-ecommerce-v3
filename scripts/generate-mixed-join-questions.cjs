#!/usr/bin/env node
/** One-shot generator: tests/fixtures/mixed-join-questions.ts — balanced join families. */
const fs = require("fs");
const outPath = "tests/fixtures/mixed-join-questions.ts";

const productNames = [
  "Tire", "Helmet", "Pedal", "Chain", "Brake", "Wheel", "Frame", "Seat", "Fork", "Jersey",
];
const colors = ["Black", "Red", "Blue", "Silver", "Yellow"];
const categories = ["Bikes", "Components", "Clothing", "Accessories"];
const subcats = ["Mountain Bikes", "Road Bikes", "Helmets", "Gloves", "Tires and Tubes"];
const customerNames = [
  "Miranda", "Michelle", "Adams", "James", "Lopez", "Chen", "Baker", "Foster",
];
const emails = ["miranda1@adventure-works.com", "michelle2@adventure-works.com"];
const phones = ["150-555-0113", "414-555-0179"];
const monthsOpts = [3, 6, 12, 24, 36];
const years = [1, 2, 3];
const ratings = [1, 2, 3, 4, 5];
const territories = [1, 4, 6, 9];
const productIds = [680, 707, 771, 870];
const customerIds = [11000, 14340, 26235];

const cases = [];
const seenQ = new Set();

function add(c) {
  if (cases.length >= 500) return false;
  const q = String(c.question).trim().replace(/\s+/g, " ");
  const key = q.toLowerCase();
  if (seenQ.has(key)) return false;
  seenQ.add(key);
  const row = { ...c, question: q };
  if (row.notes == null) delete row.notes;
  cases.push(row);
  return true;
}

function take(familyBuilders, target) {
  const before = cases.length;
  const addN = (c) => {
    if (cases.length - before >= target) return false;
    if (cases.length >= 500) return false;
    return add(c);
  };
  for (const build of familyBuilders) {
    if (cases.length - before >= target) break;
    if (cases.length >= 500) break;
    build(addN);
  }
}

// —— 1) product × sales × customer (~90) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        for (const cn of customerNames) {
          for (const y of years) {
            add({
              question: `Give products name ${pn} that sales in last ${y} year and customer have names like ${cn}`,
              expectedIntent: "products_sold_to_named_customers",
              expectedFilters: {
                productNameContains: pn,
                customerNameContains: cn,
                lastMonths: y * 12,
              },
              joinTables: [
                "product",
                "salesorderdetail",
                "salesorderheader",
                "customer",
                "individual",
                "contact",
              ],
              joinFamily: "product_sales_customer",
              implemented: pn === "Tire" && cn === "Miranda" && y === 2,
              notes:
                pn === "Tire" && cn === "Miranda" && y === 2
                  ? "seed example — mixed join product×sales×customer"
                  : undefined,
            });
          }
        }
      }
    },
    (add) => {
      for (const pn of productNames.slice(0, 5)) {
        for (const cn of customerNames.slice(0, 4)) {
          add({
            question: `Show orders of products like ${pn} bought by customers named like ${cn} in the last 24 months`,
            expectedIntent: "products_sold_to_named_customers",
            expectedFilters: {
              productNameContains: pn,
              customerNameContains: cn,
              lastMonths: 24,
            },
            joinTables: [
              "product",
              "salesorderdetail",
              "salesorderheader",
              "customer",
              "individual",
              "contact",
            ],
            joinFamily: "product_sales_customer",
            implemented: false,
          });
        }
      }
    },
  ],
  90,
);

// —— 2) product × customer who bought (~60) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        for (const cn of customerNames) {
          add({
            question: `Which customers named like ${cn} bought products named like ${pn}?`,
            expectedIntent: "customers_who_bought_product_name",
            expectedFilters: {
              productNameContains: pn,
              customerNameContains: cn,
            },
            joinTables: [
              "product",
              "salesorderdetail",
              "salesorderheader",
              "customer",
              "individual",
              "contact",
            ],
            joinFamily: "product_customer",
            implemented: false,
          });
        }
      }
    },
  ],
  60,
);

// —— 3) product × category × sales (~50) ——
take(
  [
    (add) => {
      for (const cat of categories) {
        for (const m of monthsOpts) {
          add({
            question: `Top products in category ${cat} by sales in the last ${m} months`,
            expectedIntent: "top_products_by_category_sales_period",
            expectedFilters: { category: cat, lastMonths: m, limit: 10 },
            joinTables: [
              "product",
              "productsubcategory",
              "productcategory",
              "salesorderdetail",
              "salesorderheader",
            ],
            joinFamily: "product_category_sales",
            implemented: false,
          });
          add({
            question: `How much sales value did category ${cat} generate in the last ${m} months?`,
            expectedIntent: "sum_sales_by_category_period",
            expectedFilters: { category: cat, lastMonths: m },
            joinTables: [
              "product",
              "productsubcategory",
              "productcategory",
              "salesorderdetail",
              "salesorderheader",
            ],
            joinFamily: "product_category_sales",
            implemented: false,
          });
        }
      }
    },
    (add) => {
      for (const sc of subcats) {
        for (const y of [1, 2]) {
          add({
            question: `Sales of subcategory ${sc} in the last ${y} year`,
            expectedIntent: "sum_sales_by_subcategory_period",
            expectedFilters: { subcategory: sc, lastMonths: y * 12 },
            joinTables: [
              "product",
              "productsubcategory",
              "salesorderdetail",
              "salesorderheader",
            ],
            joinFamily: "product_category_sales",
            implemented: false,
          });
        }
      }
    },
  ],
  50,
);

// —— 4) product color × customer type (~40) ——
take(
  [
    (add) => {
      for (const color of colors) {
        for (const typ of ["store", "individual"]) {
          add({
            question: `Sales of ${color} products to ${typ} customers`,
            expectedIntent: "sales_by_product_color_and_customer_type",
            expectedFilters: {
              color,
              customerType: typ === "store" ? "S" : "I",
            },
            joinTables: [
              "product",
              "salesorderdetail",
              "salesorderheader",
              "customer",
            ],
            joinFamily: "product_customer_type",
            implemented: false,
          });
          add({
            question: `How many ${color} products were bought by ${typ} customers in the last 12 months?`,
            expectedIntent:
              "count_sales_by_product_color_and_customer_type_period",
            expectedFilters: {
              color,
              customerType: typ === "store" ? "S" : "I",
              lastMonths: 12,
            },
            joinTables: [
              "product",
              "salesorderdetail",
              "salesorderheader",
              "customer",
            ],
            joinFamily: "product_customer_type",
            implemented: false,
          });
        }
      }
    },
  ],
  40,
);

// —— 5) product × review (~50) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        for (const r of ratings) {
          add({
            question: `Products named like ${pn} with review rating ${r}`,
            expectedIntent: "products_by_name_and_review_rating",
            expectedFilters: { productNameContains: pn, rating: r },
            joinTables: ["product", "productreview"],
            joinFamily: "product_review",
            implemented: false,
          });
        }
        add({
          question: `Average review rating for products named like ${pn}`,
          expectedIntent: "avg_review_rating_for_product_name",
          expectedFilters: { productNameContains: pn },
          joinTables: ["product", "productreview"],
          joinFamily: "product_review",
          implemented: false,
        });
      }
    },
  ],
  50,
);

// —— 6) product × inventory (~30) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        add({
          question: `Stock quantity for products named like ${pn}`,
          expectedIntent: "inventory_for_product_name",
          expectedFilters: { productNameContains: pn },
          joinTables: ["product", "productinventory"],
          joinFamily: "product_inventory",
          implemented: false,
          notes: "productinventory module TODO",
        });
        add({
          question: `Total inventory of product ${pn} across locations`,
          expectedIntent: "sum_inventory_for_product_name",
          expectedFilters: { productNameContains: pn },
          joinTables: ["product", "productinventory"],
          joinFamily: "product_inventory",
          implemented: false,
          notes: "productinventory module TODO",
        });
      }
      for (const pid of productIds) {
        add({
          question: `Inventory for product ${pid} by location`,
          expectedIntent: "inventory_by_product_id",
          expectedFilters: { productId: pid },
          joinTables: ["product", "productinventory"],
          joinFamily: "product_inventory",
          implemented: false,
        });
      }
    },
  ],
  30,
);

// —— 7) customer contact × sales (~50) ——
take(
  [
    (add) => {
      for (const cn of customerNames) {
        for (const m of [12, 24, 36]) {
          add({
            question: `Orders for customers with name like ${cn} in the last ${m} months`,
            expectedIntent: "orders_for_customers_by_name",
            expectedFilters: { nameContains: cn, lastMonths: m },
            joinTables: [
              "customer",
              "individual",
              "contact",
              "salesorderheader",
            ],
            joinFamily: "customer_sales",
            implemented: cn === "Miranda" && m === 12,
          });
          add({
            question: `Total sales value for customers named like ${cn} over the last ${m} months`,
            expectedIntent: "sum_sales_for_customers_by_name_period",
            expectedFilters: { nameContains: cn, lastMonths: m },
            joinTables: [
              "customer",
              "individual",
              "contact",
              "salesorderheader",
            ],
            joinFamily: "customer_sales",
            implemented: false,
          });
        }
        add({
          question: `Email and phone of customers named like ${cn} who have orders`,
          expectedIntent: "contact_of_customers_with_orders_by_name",
          expectedFilters: { nameContains: cn },
          joinTables: [
            "customer",
            "individual",
            "contact",
            "salesorderheader",
          ],
          joinFamily: "customer_sales",
          implemented: false,
        });
      }
      for (const email of emails) {
        add({
          question: `Orders for customer with email ${email}`,
          expectedIntent: "orders_for_customers_by_name",
          expectedFilters: { email },
          joinTables: [
            "customer",
            "individual",
            "contact",
            "salesorderheader",
          ],
          joinFamily: "customer_sales",
          implemented: false,
        });
      }
      for (const phone of phones) {
        add({
          question: `Sales orders for customer phone ${phone}`,
          expectedIntent: "orders_for_customers_by_name",
          expectedFilters: { phone },
          joinTables: [
            "customer",
            "individual",
            "contact",
            "salesorderheader",
          ],
          joinFamily: "customer_sales",
          implemented: false,
        });
      }
    },
  ],
  50,
);

// —— 8) territory × category (~32) ——
take(
  [
    (add) => {
      for (const tid of territories) {
        for (const cat of categories) {
          add({
            question: `Sales of category ${cat} to customers in territory ${tid}`,
            expectedIntent: "sales_by_category_and_territory",
            expectedFilters: { category: cat, territoryId: tid },
            joinTables: [
              "customer",
              "salesorderheader",
              "salesorderdetail",
              "product",
              "productsubcategory",
              "productcategory",
            ],
            joinFamily: "territory_category_sales",
            implemented: false,
          });
          add({
            question: `How many orders of ${cat} products from territory ${tid}?`,
            expectedIntent: "count_orders_by_category_and_territory",
            expectedFilters: { category: cat, territoryId: tid },
            joinTables: [
              "customer",
              "salesorderheader",
              "salesorderdetail",
              "product",
              "productsubcategory",
              "productcategory",
            ],
            joinFamily: "territory_category_sales",
            implemented: false,
          });
        }
      }
    },
  ],
  32,
);

// —— 9) review × category (~20) ——
take(
  [
    (add) => {
      for (const cat of categories) {
        for (const r of [1, 2, 5]) {
          add({
            question: `Reviews with rating ${r} for products in category ${cat}`,
            expectedIntent: "reviews_by_rating_and_category",
            expectedFilters: { rating: r, category: cat },
            joinTables: [
              "productreview",
              "product",
              "productsubcategory",
              "productcategory",
            ],
            joinFamily: "review_category",
            implemented: false,
          });
        }
        add({
          question: `Average rating of products in category ${cat}`,
          expectedIntent: "avg_review_rating_by_category",
          expectedFilters: { category: cat },
          joinTables: [
            "productreview",
            "product",
            "productsubcategory",
            "productcategory",
          ],
          joinFamily: "review_category",
          implemented: false,
        });
      }
    },
  ],
  20,
);

// —— 10) product sales qty (~20) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        add({
          question: `List price and quantity sold for products like ${pn}`,
          expectedIntent: "price_and_qty_sold_for_product_name",
          expectedFilters: { productNameContains: pn },
          joinTables: ["product", "salesorderdetail"],
          joinFamily: "product_sales_qty",
          implemented: false,
        });
        add({
          question: `Units sold of ${pn} products in the last 24 months`,
          expectedIntent: "sum_qty_sold_for_product_name_period",
          expectedFilters: { productNameContains: pn, lastMonths: 24 },
          joinTables: ["product", "salesorderdetail", "salesorderheader"],
          joinFamily: "product_sales_qty",
          implemented: false,
        });
      }
    },
  ],
  20,
);

// —— 11) customer id × product id (~24) ——
take(
  [
    (add) => {
      for (const cid of customerIds) {
        for (const pid of productIds) {
          add({
            question: `Did customer ${cid} buy product ${pid}?`,
            expectedIntent: "customer_bought_product_id",
            expectedFilters: { customerId: cid, productId: pid },
            joinTables: [
              "salesorderheader",
              "salesorderdetail",
              "product",
              "customer",
            ],
            joinFamily: "customer_product_id",
            implemented: false,
          });
          add({
            question: `Orders where customer ${cid} purchased product ${pid}`,
            expectedIntent: "orders_for_customer_and_product",
            expectedFilters: { customerId: cid, productId: pid },
            joinTables: [
              "salesorderheader",
              "salesorderdetail",
              "customer",
              "product",
            ],
            joinFamily: "customer_product_id",
            implemented: false,
          });
        }
      }
    },
  ],
  24,
);

// —— 12) order status × customer (~16) ——
take(
  [
    (add) => {
      for (const status of [1, 5]) {
        for (const cn of customerNames) {
          add({
            question: `Orders with status ${status} for customers named like ${cn}`,
            expectedIntent: "orders_by_status_and_customer_name",
            expectedFilters: { status, nameContains: cn },
            joinTables: [
              "salesorderheader",
              "customer",
              "individual",
              "contact",
            ],
            joinFamily: "order_status_customer",
            implemented: false,
          });
        }
      }
    },
  ],
  16,
);

// —— 13) online × product (~10) ——
take(
  [
    (add) => {
      for (const pn of productNames) {
        add({
          question: `Online orders that include products like ${pn}`,
          expectedIntent: "online_orders_for_product_name",
          expectedFilters: {
            productNameContains: pn,
            onlineOrderFlag: true,
          },
          joinTables: ["salesorderheader", "salesorderdetail", "product"],
          joinFamily: "online_product",
          implemented: false,
        });
      }
    },
  ],
  10,
);

// —— 14) inventory × category (~8) ——
take(
  [
    (add) => {
      for (const cat of categories) {
        add({
          question: `Total stock for products in category ${cat}`,
          expectedIntent: "sum_inventory_by_category",
          expectedFilters: { category: cat },
          joinTables: [
            "productinventory",
            "product",
            "productsubcategory",
            "productcategory",
          ],
          joinFamily: "inventory_category",
          implemented: false,
          notes: "productinventory module TODO",
        });
        add({
          question: `Locations holding stock for category ${cat}`,
          expectedIntent: "inventory_locations_by_category",
          expectedFilters: { category: cat },
          joinTables: [
            "productinventory",
            "product",
            "productsubcategory",
            "productcategory",
          ],
          joinFamily: "inventory_category",
          implemented: false,
          notes: "productinventory module TODO",
        });
      }
    },
  ],
  8,
);

// —— 15) review reviewer × product (~24) ——
take(
  [
    (add) => {
      for (const cn of customerNames) {
        for (const pn of productNames.slice(0, 3)) {
          add({
            question: `Reviews by reviewer like ${cn} on products like ${pn}`,
            expectedIntent: "reviews_by_reviewer_and_product_name",
            expectedFilters: {
              reviewerContains: cn,
              productNameContains: pn,
            },
            joinTables: ["productreview", "product"],
            joinFamily: "review_product_reviewer",
            implemented: false,
          });
        }
      }
    },
  ],
  24,
);

// —— fill remaining with mixed_multi paraphrases ——
let fill = 0;
while (cases.length < 500 && fill < 5000) {
  fill += 1;
  const pn = productNames[fill % productNames.length];
  const cn = customerNames[fill % customerNames.length];
  const cat = categories[fill % categories.length];
  const m = monthsOpts[fill % monthsOpts.length];
  const color = colors[fill % colors.length];
  const tid = territories[fill % territories.length];
  const sc = subcats[fill % subcats.length];
  const variants = [
    {
      question: `Find ${pn} product sales linked to customer ${cn} last ${m} months with category ${cat}`,
      expectedIntent: "products_sold_to_named_customers",
      expectedFilters: {
        productNameContains: pn,
        customerNameContains: cn,
        lastMonths: m,
        category: cat,
      },
      joinTables: [
        "product",
        "productsubcategory",
        "productcategory",
        "salesorderdetail",
        "salesorderheader",
        "customer",
        "individual",
        "contact",
      ],
      joinFamily: "product_sales_customer_category",
      implemented: false,
    },
    {
      question: `Mixed join: ${color} ${pn} sold to ${cn} customers in territory ${tid}`,
      expectedIntent: "sales_by_product_color_customer_name_territory",
      expectedFilters: {
        color,
        productNameContains: pn,
        customerNameContains: cn,
        territoryId: tid,
      },
      joinTables: [
        "product",
        "salesorderdetail",
        "salesorderheader",
        "customer",
        "individual",
        "contact",
      ],
      joinFamily: "mixed_multi",
      implemented: false,
    },
    {
      question: `Cross-table: list ${pn} and contact email for buyers named ${cn}`,
      expectedIntent: "product_and_buyer_email_by_names",
      expectedFilters: {
        productNameContains: pn,
        customerNameContains: cn,
      },
      joinTables: [
        "product",
        "salesorderdetail",
        "salesorderheader",
        "customer",
        "individual",
        "contact",
      ],
      joinFamily: "product_customer",
      implemented: false,
    },
    {
      question: `Join sales and reviews: products like ${pn} sold last ${m} months that have ratings`,
      expectedIntent: "sold_products_with_reviews_period",
      expectedFilters: { productNameContains: pn, lastMonths: m },
      joinTables: [
        "product",
        "salesorderdetail",
        "salesorderheader",
        "productreview",
      ],
      joinFamily: "sales_review",
      implemented: false,
    },
    {
      question: `Internal join mix ${fill}: subcategory sales of ${sc} to store customers`,
      expectedIntent: "subcategory_sales_to_store_customers",
      expectedFilters: { subcategory: sc, customerType: "S" },
      joinTables: [
        "product",
        "productsubcategory",
        "salesorderdetail",
        "salesorderheader",
        "customer",
      ],
      joinFamily: "product_customer_type",
      implemented: false,
    },
  ];
  for (const v of variants) {
    if (cases.length >= 500) break;
    add(v);
  }
}

if (cases.length !== 500) {
  console.error("Expected 500, got", cases.length);
  process.exit(1);
}

cases.forEach((c, i) => {
  c.id = `MJ${String(i + 1).padStart(3, "0")}`;
});

const header = `/**
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
`;

const footer = `;

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
`;

fs.writeFileSync(outPath, header + JSON.stringify(cases, null, 2) + footer);

const fam = {};
for (const c of cases) fam[c.joinFamily] = (fam[c.joinFamily] || 0) + 1;
console.log("wrote", outPath);
console.log("count", cases.length, "implemented", cases.filter((c) => c.implemented).length);
console.log(fam);
