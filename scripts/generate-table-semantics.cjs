#!/usr/bin/env node
/**
 * Generates src/query-agent/domain/tables/<entity>/semantics.ts from intents + heuristics.
 * Re-run after adding intents; then tweak notes/metrics by hand if needed.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function readIntents(rel) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const m = src.match(/export const \w+_INTENTS = \[([\s\S]*?)\] as const/);
  if (!m) throw new Error("no intents in " + rel);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

function inferGrain(intent, entity) {
  if (/^count_|^avg_|^sum_|^min_|^max_|^median_|^variance_|^pct_|^total_/.test(intent)) {
    if (/_by_/.test(intent) || /_per_/.test(intent)) return "group_row";
    return "scalar";
  }
  if (entity === "product") return "product";
  if (entity === "customer") {
    if (intent.startsWith("orders_")) return "order";
    return "customer";
  }
  if (entity === "review") return "review";
  if (entity === "salesorderheader") return "order";
  if (entity === "salesorderdetail") return "order_line";
  if (entity === "mixed") return "order_line";
  return "group_row";
}

function inferMetric(intent, entity) {
  if (intent.startsWith("count_")) return "COUNT(*) or distinct count for " + intent;
  if (intent.startsWith("avg_") || intent.startsWith("average_")) return "AVG(...) for " + intent;
  if (intent.startsWith("sum_") || intent.startsWith("total_")) return "SUM(...) for " + intent;
  if (intent.startsWith("min_")) return "MIN(...) for " + intent;
  if (intent.startsWith("max_")) return "MAX(...) for " + intent;
  if (intent.startsWith("median_")) return "median aggregate for " + intent;
  if (intent.startsWith("variance_")) return "VARIANCE(...) for " + intent;
  if (intent.startsWith("pct_")) return "percentage for " + intent;
  if (intent.startsWith("top_") || intent.startsWith("lowest_") || intent.startsWith("least_")) {
    return "ranked list for " + intent;
  }
  if (intent.startsWith("list_") || intent.startsWith("sample_") || intent.startsWith("latest_") || intent.startsWith("oldest_")) {
    return "row listing for " + intent;
  }
  if (entity === "product") return "product attribute / listing";
  if (entity === "customer") return "customer attribute / spend listing";
  if (entity === "review") return "review attribute / listing";
  if (entity === "salesorderheader") return "order-level metric or listing";
  if (entity === "salesorderdetail") return "line-item metric or listing";
  if (entity === "mixed") return "cross-table product×sales×customer listing";
  return intent;
}

function inferJoins(intent, entity) {
  const full = {
    product: ["product", "productsubcategory", "productcategory"],
    review: ["productreview", "product", "productsubcategory", "productcategory"],
    salesorderheader: ["salesorderheader"],
    salesorderdetail: [
      "salesorderdetail",
      "salesorderheader",
      "product",
      "productsubcategory",
      "productcategory",
    ],
    customer: [
      "customer",
      "individual",
      "contact",
      "salesorderheader",
      "salesorderdetail",
      "product",
      "productsubcategory",
      "productcategory",
    ],
    mixed: [
      "product",
      "salesorderdetail",
      "salesorderheader",
      "customer",
      "individual",
      "contact",
      "productsubcategory",
      "productcategory",
    ],
  }[entity] || [];
  return [...full];
}

function inferTimeField(intent, entity) {
  if (!/period|last_|year|month|days|ship|due|modified_after|sell_start|newest/.test(intent)) {
    return undefined;
  }
  if (entity === "product") return "product.SellStartDate";
  if (entity === "review") return "productreview.ReviewDate";
  if (entity === "customer") {
    if (/modified/.test(intent)) return "customer.ModifiedDate";
    return "salesorderheader.OrderDate";
  }
  if (entity === "salesorderheader") {
    if (/ship/.test(intent)) return "salesorderheader.ShipDate";
    if (/due/.test(intent)) return "salesorderheader.DueDate";
    return "salesorderheader.OrderDate";
  }
  if (entity === "salesorderdetail" || entity === "mixed") {
    return "salesorderheader.OrderDate";
  }
  return undefined;
}

function inferFilters(intent, entity) {
  const keys = new Set();
  if (/limit|top_|lowest_|least_|list_|sample_|latest_|oldest_|longest_/.test(intent)) {
    keys.add("limit");
  }
  if (/period|last_months|last_days|over_period|shipped_period/.test(intent) || /last_\d|months/.test(intent)) {
    keys.add("lastMonths");
    keys.add("lastDays");
  }
  if (/_year|in_year|by_year|year_range|compare_sales_years|sell_start|modified_after/.test(intent)) {
    keys.add("year");
    keys.add("years");
    keys.add("startYear");
    keys.add("endYear");
    keys.add("sellStartYear");
  }
  if (/month/.test(intent)) keys.add("month");
  if (/category/.test(intent)) keys.add("category");
  if (/subcategor/.test(intent)) keys.add("subcategory");
  if (/color/.test(intent)) {
    keys.add("color");
    keys.add("colors");
  }
  if (/size/.test(intent)) keys.add("size");
  if (/class/.test(intent)) keys.add("class");
  if (/style/.test(intent)) keys.add("style");
  if (/model/.test(intent)) keys.add("model");
  if (/product_line|productLine/.test(intent)) keys.add("productLine");
  if (/price|expensive|cheap/.test(intent)) {
    keys.add("maxPrice");
    keys.add("minPrice");
  }
  if (/product_id|for_product|product_by|lines_for_product|qty_for_product|bought_product/.test(intent)) {
    keys.add("productId");
  }
  if (/customer_id|for_customer|customer_by_id|spend_for_id|order_count_for_id|bought_product_id|orders_for_customer_and_product/.test(intent)) {
    keys.add("customerId");
  }
  if (/account/.test(intent)) keys.add("accountNumber");
  if (/territory/.test(intent)) keys.add("territoryId");
  if (/type|store_customers|individual_customers/.test(intent)) keys.add("customerType");
  if (/status/.test(intent)) keys.add("status");
  if (/salesperson/.test(intent)) keys.add("salesPersonId");
  if (/order_id|for_order|lines_for_order|order_by_id/.test(intent)) keys.add("salesOrderId");
  if (/line_by_id/.test(intent)) keys.add("salesOrderDetailId");
  if (/review_by_id|for_product/.test(intent) && entity === "review") keys.add("reviewId");
  if (/rating/.test(intent)) {
    keys.add("rating");
    keys.add("minRating");
    keys.add("maxRating");
  }
  if (/reviewer/.test(intent)) {
    keys.add("reviewer");
    keys.add("reviewerContains");
  }
  if (/comment/.test(intent)) keys.add("hasComments");
  if (/name/.test(intent) || entity === "mixed") {
    keys.add("nameContains");
    keys.add("firstName");
    keys.add("lastName");
    keys.add("productNameContains");
    keys.add("customerNameContains");
  }
  if (/email/.test(intent)) keys.add("email");
  if (/phone/.test(intent)) keys.add("phone");
  if (/spend_over|minSpend/.test(intent)) keys.add("minSpend");
  if (/spend_under|maxSpend/.test(intent)) keys.add("maxSpend");
  if (/min_orders/.test(intent)) keys.add("minOrders");
  if (/make_flag/.test(intent)) keys.add("makeFlag");
  if (/finished/.test(intent)) keys.add("finishedGoodsFlag");
  if (/online/.test(intent)) keys.add("onlineOrderFlag");
  if (/compare.*categor/.test(intent)) keys.add("categories");
  if (/compare_product/.test(intent)) keys.add("productIds");
  if (/special_offer/.test(intent)) keys.add("specialOfferId");
  if (/weight/.test(intent)) keys.add("minWeight");
  if (/reorder/.test(intent)) keys.add("minReorderPoint");
  if (/days_to_manufacture/.test(intent)) keys.add("minDaysToManufacture");
  if (/product_number|prefix/.test(intent)) keys.add("productNumberPrefix");
  if (/list_products/.test(intent)) {
    [
      "maxPrice",
      "minPrice",
      "color",
      "colors",
      "size",
      "category",
      "subcategory",
      "nameContains",
      "productNumberPrefix",
      "productLine",
      "finishedGoodsFlag",
      "sellStartYear",
      "minDaysToManufacture",
      "minReorderPoint",
      "limit",
      "includeZeroPrice",
    ].forEach((k) => keys.add(k));
  }
  // Always allow empty-filter intents to have [] — add common safety keys for list intents
  if (keys.size === 0 && /list_|sample_|show_|top_|lowest_/.test(intent)) {
    keys.add("limit");
  }
  return [...keys];
}

const modules = [
  {
    entity: "product",
    intentsRel: "src/query-agent/domain/tables/product/intents.ts",
    outRel: "src/query-agent/domain/tables/product/semantics.ts",
    constName: "PRODUCT_SEMANTICS",
  },
  {
    entity: "review",
    intentsRel: "src/query-agent/domain/tables/review/intents.ts",
    outRel: "src/query-agent/domain/tables/review/semantics.ts",
    constName: "REVIEW_SEMANTICS",
  },
  {
    entity: "salesorderheader",
    intentsRel: "src/query-agent/domain/tables/salesorderheader/intents.ts",
    outRel: "src/query-agent/domain/tables/salesorderheader/semantics.ts",
    constName: "SALES_ORDER_HEADER_SEMANTICS",
  },
  {
    entity: "salesorderdetail",
    intentsRel: "src/query-agent/domain/tables/salesorderdetail/intents.ts",
    outRel: "src/query-agent/domain/tables/salesorderdetail/semantics.ts",
    constName: "SALES_ORDER_DETAIL_SEMANTICS",
  },
  {
    entity: "customer",
    intentsRel: "src/query-agent/domain/tables/customer/intents.ts",
    outRel: "src/query-agent/domain/tables/customer/semantics.ts",
    constName: "CUSTOMER_SEMANTICS",
  },
  {
    entity: "mixed",
    intentsRel: "src/query-agent/domain/tables/mixed/intents.ts",
    outRel: "src/query-agent/domain/tables/mixed/semantics.ts",
    constName: "MIXED_SEMANTICS",
  },
];

for (const mod of modules) {
  const intents = readIntents(mod.intentsRel);
  const entries = intents.map((intent) => {
    const joins = inferJoins(intent, mod.entity);
    const timeField = inferTimeField(intent, mod.entity);
    const filtersAllowed = inferFilters(intent, mod.entity);
    const def = {
      intent,
      entity: mod.entity,
      metric: inferMetric(intent, mod.entity),
      grain: inferGrain(intent, mod.entity),
      joins,
      ...(timeField ? { timeField } : {}),
      filtersAllowed,
    };
    return def;
  });

  // Special-case mixed seed intent
  if (mod.entity === "mixed") {
    const d = entries.find((e) => e.intent === "products_sold_to_named_customers");
    if (d) {
      d.metric = "Line items: product sold to named customer (LineTotal / OrderQty)";
      d.grain = "order_line";
      d.timeField = "salesorderheader.OrderDate";
      d.filtersAllowed = [
        "productNameContains",
        "customerNameContains",
        "lastMonths",
        "category",
        "limit",
      ];
      d.notes =
        "Cross-table seed: product → detail → header → customer → individual → contact";
    }
  }

  if (mod.entity === "customer") {
    for (const d of entries) {
      if (d.intent === "orders_for_customers_by_name") {
        d.metric = "Order list (TotalDue) for customers matching contact name/email/phone";
        d.grain = "order";
        d.timeField = "salesorderheader.OrderDate";
        d.joins = [
          "customer",
          "individual",
          "contact",
          "salesorderheader",
        ];
        d.filtersAllowed = [
          "nameContains",
          "firstName",
          "lastName",
          "email",
          "phone",
          "lastMonths",
          "limit",
        ];
      }
      if (d.intent === "customers_by_name" || d.intent === "count_customers_by_name") {
        d.joins = ["customer", "individual", "contact"];
        d.filtersAllowed = [
          "nameContains",
          "firstName",
          "lastName",
          "email",
          "phone",
          "limit",
        ];
      }
      if (/spend|sales|top_customers|lowest_customers|account_numbers_by_sales/.test(d.intent)) {
        if (!d.joins.includes("salesorderheader")) d.joins.push("salesorderheader");
        if (!d.joins.includes("individual")) d.joins.push("individual");
        if (!d.joins.includes("contact")) d.joins.push("contact");
        if (!d.timeField && /period/.test(d.intent)) d.timeField = "salesorderheader.OrderDate";
      }
    }
  }

  const mapLiteral = Object.fromEntries(entries.map((d) => [d.intent, d]));

  const body = `/**
 * semantics.ts — ${mod.entity} semantic layer (metric / grain / joins / filters).
 * Traceability for intents in this module. SQL templates remain in sql.ts;
 * the registry validates plans and FROM/JOIN tables against these defs.
 *
 * Generated by scripts/generate-table-semantics.cjs — edit carefully or re-generate.
 */
import type { SemanticDef } from "@/query-agent/domain/semantics/types";

export const ${mod.constName}: Readonly<Record<string, SemanticDef>> = ${JSON.stringify(mapLiteral, null, 2)} as const;
`;

  fs.writeFileSync(path.join(root, mod.outRel), body);
  console.log("wrote", mod.outRel, "intents", intents.length);
}
