/**
 * sql.ts — salesorderdetail SELECT templates (line items / product sales).
 * Joins: product, productsubcategory, productcategory, salesorderheader (year/online/period).
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import {
  asStringFilter,
  clampInt,
} from "@/query-agent/domain/tables/salesorderdetail/extract";

const PRODUCT_JOIN = `FROM salesorderdetail d
INNER JOIN product p ON p.ProductID = d.ProductID`;

const CATEGORY_JOINS = `FROM salesorderdetail d
INNER JOIN product p ON p.ProductID = d.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`;

const HEADER_JOIN = `FROM salesorderdetail d
INNER JOIN salesorderheader h ON h.SalesOrderID = d.SalesOrderID`;

const PRODUCT_HEADER_JOIN = `FROM salesorderdetail d
INNER JOIN product p ON p.ProductID = d.ProductID
INNER JOIN salesorderheader h ON h.SalesOrderID = d.SalesOrderID`;

const limitClause = (limit: number): string => {
  return `LIMIT ${limit}`;
}

export const buildSalesOrderDetailQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  switch (plan.intent) {
    case "count_order_lines":
      return {
        sql: `SELECT COUNT(*) AS lineCount FROM salesorderdetail`,
        params: [],
        columns: ["lineCount"],
      };
    case "sum_order_qty":
      return {
        sql: `SELECT COALESCE(SUM(OrderQty), 0) AS totalQty FROM salesorderdetail`,
        params: [],
        columns: ["totalQty"],
      };
    case "top_products_by_sales":
    case "least_sold_products": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent === "top_products_by_sales";
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold,
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY qtySold ${desc ? "DESC" : "ASC"}, salesValue ${desc ? "DESC" : "ASC"}
${limitClause(limit)}`,
        params: [],
        columns: ["productName", "qtySold", "salesValue"],
      };
    }
    case "sales_qty_by_product":
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY qtySold DESC`,
        params: [],
        columns: ["productName", "qtySold"],
      };
    case "top_products_by_revenue":
    case "least_products_by_revenue": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent === "top_products_by_revenue";
      return {
        sql: `SELECT p.Name AS productName, COALESCE(SUM(d.LineTotal), 0) AS revenue,
  SUM(d.OrderQty) AS qtySold
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY revenue ${desc ? "DESC" : "ASC"}, qtySold ${desc ? "DESC" : "ASC"}
${limitClause(limit)}`,
        params: [],
        columns: ["productName", "revenue", "qtySold"],
      };
    }
    case "avg_order_qty":
      return {
        sql: `SELECT AVG(OrderQty) AS avgQty FROM salesorderdetail`,
        params: [],
        columns: ["avgQty"],
      };
    case "avg_unit_price":
      return {
        sql: `SELECT AVG(UnitPrice) AS avgUnitPrice FROM salesorderdetail`,
        params: [],
        columns: ["avgUnitPrice"],
      };
    case "sum_line_total":
      return {
        sql: `SELECT COALESCE(SUM(LineTotal), 0) AS totalLineTotal FROM salesorderdetail`,
        params: [],
        columns: ["totalLineTotal"],
      };
    case "line_total_by_product":
      return {
        sql: `SELECT p.Name AS productName, COALESCE(SUM(d.LineTotal), 0) AS lineTotal
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY lineTotal DESC`,
        params: [],
        columns: ["productName", "lineTotal"],
      };
    case "count_lines_for_order": {
      const salesOrderId = clampInt(f.salesOrderId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT COUNT(*) AS lineCount FROM salesorderdetail WHERE SalesOrderID = ?`,
        params: [salesOrderId],
        columns: ["lineCount"],
      };
    }
    case "list_lines_for_order": {
      const salesOrderId = clampInt(f.salesOrderId, 0, 1, 2_147_483_647);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, ProductID AS productId,
  OrderQty AS orderQty, UnitPrice AS unitPrice, LineTotal AS lineTotal
FROM salesorderdetail
WHERE SalesOrderID = ?
ORDER BY SalesOrderDetailID ASC
${limitClause(limit)}`,
        params: [salesOrderId],
        columns: [
          "salesOrderDetailId",
          "productId",
          "orderQty",
          "unitPrice",
          "lineTotal",
        ],
      };
    }
    case "count_lines_for_product": {
      const productId = clampInt(f.productId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT COUNT(*) AS lineCount FROM salesorderdetail WHERE ProductID = ?`,
        params: [productId],
        columns: ["lineCount"],
      };
    }
    case "sales_qty_for_product": {
      const productId = clampInt(f.productId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT COALESCE(SUM(OrderQty), 0) AS totalQty
FROM salesorderdetail WHERE ProductID = ?`,
        params: [productId],
        columns: ["totalQty"],
      };
    }
    case "list_lines_for_product": {
      const productId = clampInt(f.productId, 0, 1, 2_147_483_647);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  OrderQty AS orderQty, UnitPrice AS unitPrice, LineTotal AS lineTotal
FROM salesorderdetail
WHERE ProductID = ?
ORDER BY SalesOrderDetailID ASC
${limitClause(limit)}`,
        params: [productId],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "orderQty",
          "unitPrice",
          "lineTotal",
        ],
      };
    }
    case "avg_qty_by_product":
      return {
        sql: `SELECT p.Name AS productName, AVG(d.OrderQty) AS avgQty
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY avgQty DESC`,
        params: [],
        columns: ["productName", "avgQty"],
      };
    case "max_order_qty":
      return {
        sql: `SELECT MAX(OrderQty) AS maxQty FROM salesorderdetail`,
        params: [],
        columns: ["maxQty"],
      };
    case "min_order_qty":
      return {
        sql: `SELECT MIN(OrderQty) AS minQty FROM salesorderdetail`,
        params: [],
        columns: ["minQty"],
      };
    case "list_lines_min_qty": {
      const minQty = clampInt(f.minQty, 1, 1, 1_000_000);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, LineTotal AS lineTotal
FROM salesorderdetail
WHERE OrderQty > ?
ORDER BY OrderQty DESC
${limitClause(limit)}`,
        params: [minQty],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "lineTotal",
        ],
      };
    }
    case "list_lines_max_unit_price": {
      const maxUnitPrice = Number(f.maxUnitPrice);
      const price =
        Number.isFinite(maxUnitPrice) && maxUnitPrice > 0 ? maxUnitPrice : 50;
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, UnitPrice AS unitPrice
FROM salesorderdetail
WHERE UnitPrice < ?
ORDER BY UnitPrice ASC
${limitClause(limit)}`,
        params: [price],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "unitPrice",
        ],
      };
    }
    case "top_products_by_sales_category":
    case "least_sold_products_category": {
      const category = asStringFilter(f.category) ?? "Bikes";
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent === "top_products_by_sales_category";
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold,
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
${CATEGORY_JOINS}
WHERE pc.Name = ?
GROUP BY p.ProductID, p.Name
ORDER BY qtySold ${desc ? "DESC" : "ASC"}, salesValue ${desc ? "DESC" : "ASC"}
${limitClause(limit)}`,
        params: [category],
        columns: ["productName", "qtySold", "salesValue"],
      };
    }
    case "sales_qty_by_category":
      return {
        sql: `SELECT pc.Name AS categoryName, SUM(d.OrderQty) AS qtySold
${CATEGORY_JOINS}
GROUP BY pc.ProductCategoryID, pc.Name
ORDER BY qtySold DESC`,
        params: [],
        columns: ["categoryName", "qtySold"],
      };
    case "line_total_by_category":
      return {
        sql: `SELECT pc.Name AS categoryName, COALESCE(SUM(d.LineTotal), 0) AS lineTotal
${CATEGORY_JOINS}
GROUP BY pc.ProductCategoryID, pc.Name
ORDER BY lineTotal DESC`,
        params: [],
        columns: ["categoryName", "lineTotal"],
      };
    case "sales_qty_by_subcategory":
      return {
        sql: `SELECT ps.Name AS subcategoryName, SUM(d.OrderQty) AS qtySold
FROM salesorderdetail d
INNER JOIN product p ON p.ProductID = d.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
GROUP BY ps.ProductSubcategoryID, ps.Name
ORDER BY qtySold DESC`,
        params: [],
        columns: ["subcategoryName", "qtySold"],
      };
    case "sales_qty_by_color":
      return {
        sql: `SELECT p.Color AS color, SUM(d.OrderQty) AS qtySold
${PRODUCT_JOIN}
WHERE p.Color IS NOT NULL AND p.Color <> ''
GROUP BY p.Color
ORDER BY qtySold DESC`,
        params: [],
        columns: ["color", "qtySold"],
      };
    case "top_products_by_sales_color": {
      const color = asStringFilter(f.color) ?? "Black";
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold,
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
${PRODUCT_JOIN}
WHERE p.Color = ?
GROUP BY p.ProductID, p.Name
ORDER BY qtySold DESC, salesValue DESC
${limitClause(limit)}`,
        params: [color],
        columns: ["productName", "qtySold", "salesValue"],
      };
    }
    case "count_distinct_products_sold":
      return {
        sql: `SELECT COUNT(DISTINCT ProductID) AS productCount FROM salesorderdetail`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_never_sold":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product p
LEFT JOIN salesorderdetail d ON d.ProductID = p.ProductID
WHERE d.SalesOrderDetailID IS NULL`,
        params: [],
        columns: ["productCount"],
      };
    case "list_sold_products": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT DISTINCT p.Name AS productName, p.ProductID AS productId
${PRODUCT_JOIN}
ORDER BY p.Name ASC
${limitClause(limit)}`,
        params: [],
        columns: ["productName", "productId"],
      };
    }
    case "avg_line_total":
      return {
        sql: `SELECT AVG(LineTotal) AS avgLineTotal FROM salesorderdetail`,
        params: [],
        columns: ["avgLineTotal"],
      };
    case "median_order_qty":
      return {
        sql: `SELECT AVG(mid.OrderQty) AS medianQty
FROM (
  SELECT OrderQty FROM salesorderdetail
  ORDER BY OrderQty
  LIMIT 2 - (SELECT COUNT(*) FROM salesorderdetail) % 2
  OFFSET (SELECT (COUNT(*) - 1) DIV 2 FROM salesorderdetail)
) AS mid`,
        params: [],
        columns: ["medianQty"],
      };
    case "variance_order_qty":
      return {
        sql: `SELECT VARIANCE(OrderQty) AS varianceQty FROM salesorderdetail`,
        params: [],
        columns: ["varianceQty"],
      };
    case "sales_qty_by_year":
      return {
        sql: `SELECT YEAR(h.OrderDate) AS orderYear, SUM(d.OrderQty) AS qtySold
${HEADER_JOIN}
GROUP BY YEAR(h.OrderDate)
ORDER BY orderYear ASC`,
        params: [],
        columns: ["orderYear", "qtySold"],
      };
    case "line_total_by_year":
      return {
        sql: `SELECT YEAR(h.OrderDate) AS orderYear, COALESCE(SUM(d.LineTotal), 0) AS lineTotal
${HEADER_JOIN}
GROUP BY YEAR(h.OrderDate)
ORDER BY orderYear ASC`,
        params: [],
        columns: ["orderYear", "lineTotal"],
      };
    case "top_products_by_sales_period": {
      const months = clampInt(f.lastMonths, 12, 1, 120);
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold,
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
${PRODUCT_HEADER_JOIN}
WHERE h.OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)
GROUP BY p.ProductID, p.Name
ORDER BY qtySold DESC, salesValue DESC
${limitClause(limit)}`,
        params: [months],
        columns: ["productName", "qtySold", "salesValue"],
      };
    }
    case "sum_order_qty_period": {
      const months = clampInt(f.lastMonths, 3, 1, 120);
      return {
        sql: `SELECT COALESCE(SUM(d.OrderQty), 0) AS totalQty
${HEADER_JOIN}
WHERE h.OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)`,
        params: [months],
        columns: ["totalQty"],
      };
    }
    case "compare_product_qty": {
      const raw = Array.isArray(f.productIds) ? f.productIds : [];
      const ids = raw
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n) && n > 0)
        .map((n) => Math.floor(n))
        .slice(0, 2);
      if (ids.length < 2) return null;
      return {
        sql: `SELECT p.ProductID AS productId, p.Name AS productName,
  COALESCE(SUM(d.OrderQty), 0) AS qtySold
FROM product p
LEFT JOIN salesorderdetail d ON d.ProductID = p.ProductID
WHERE p.ProductID IN (?, ?)
GROUP BY p.ProductID, p.Name
ORDER BY p.ProductID ASC`,
        params: [ids[0], ids[1]],
        columns: ["productId", "productName", "qtySold"],
      };
    }
    case "line_by_id": {
      const id = clampInt(f.salesOrderDetailId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, UnitPrice AS unitPrice,
  UnitPriceDiscount AS unitPriceDiscount, LineTotal AS lineTotal,
  CarrierTrackingNumber AS carrierTrackingNumber, SpecialOfferID AS specialOfferId
FROM salesorderdetail
WHERE SalesOrderDetailID = ?
LIMIT 1`,
        params: [id],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "unitPrice",
          "unitPriceDiscount",
          "lineTotal",
          "carrierTrackingNumber",
          "specialOfferId",
        ],
      };
    }
    case "sample_order_lines": {
      const limit = clampInt(f.limit, 15, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, LineTotal AS lineTotal
FROM salesorderdetail
ORDER BY RAND()
${limitClause(limit)}`,
        params: [],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "lineTotal",
        ],
      };
    }
    case "latest_order_lines": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, LineTotal AS lineTotal
FROM salesorderdetail
ORDER BY SalesOrderID DESC, SalesOrderDetailID DESC
${limitClause(limit)}`,
        params: [],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "lineTotal",
        ],
      };
    }
    case "sum_order_qty_category": {
      const category = asStringFilter(f.category) ?? "Bikes";
      return {
        sql: `SELECT COALESCE(SUM(d.OrderQty), 0) AS totalQty
${CATEGORY_JOINS}
WHERE pc.Name = ?`,
        params: [category],
        columns: ["totalQty"],
      };
    }
    case "avg_unit_price_by_product":
      return {
        sql: `SELECT p.Name AS productName, AVG(d.UnitPrice) AS avgUnitPrice
${PRODUCT_JOIN}
GROUP BY p.ProductID, p.Name
ORDER BY avgUnitPrice DESC`,
        params: [],
        columns: ["productName", "avgUnitPrice"],
      };
    case "count_discounted_lines":
      return {
        sql: `SELECT COUNT(*) AS lineCount
FROM salesorderdetail
WHERE UnitPriceDiscount > 0`,
        params: [],
        columns: ["lineCount"],
      };
    case "list_discounted_lines": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty, UnitPriceDiscount AS unitPriceDiscount,
  LineTotal AS lineTotal
FROM salesorderdetail
WHERE UnitPriceDiscount > 0
ORDER BY UnitPriceDiscount DESC
${limitClause(limit)}`,
        params: [],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
          "unitPriceDiscount",
          "lineTotal",
        ],
      };
    }
    case "sum_line_discount":
      return {
        sql: `SELECT COALESCE(SUM(OrderQty * UnitPrice * UnitPriceDiscount), 0) AS totalDiscount
FROM salesorderdetail`,
        params: [],
        columns: ["totalDiscount"],
      };
    case "count_lines_online_orders":
      return {
        sql: `SELECT COUNT(*) AS lineCount
${HEADER_JOIN}
WHERE h.OnlineOrderFlag = 1`,
        params: [],
        columns: ["lineCount"],
      };
    case "sum_order_qty_finished_goods":
      return {
        sql: `SELECT COALESCE(SUM(d.OrderQty), 0) AS totalQty
${PRODUCT_JOIN}
WHERE p.FinishedGoodsFlag = 1`,
        params: [],
        columns: ["totalQty"],
      };
    case "top_products_by_sales_max_price": {
      const maxPrice = Number(f.maxPrice);
      const price =
        Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : 50;
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT p.Name AS productName, SUM(d.OrderQty) AS qtySold,
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
${PRODUCT_JOIN}
WHERE p.ListPrice < ?
GROUP BY p.ProductID, p.Name
ORDER BY qtySold DESC, salesValue DESC
${limitClause(limit)}`,
        params: [price],
        columns: ["productName", "qtySold", "salesValue"],
      };
    }
    case "count_lines_with_tracking":
      return {
        sql: `SELECT COUNT(*) AS lineCount
FROM salesorderdetail
WHERE CarrierTrackingNumber IS NOT NULL AND CarrierTrackingNumber <> ''`,
        params: [],
        columns: ["lineCount"],
      };
    case "list_lines_without_tracking": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderDetailID AS salesOrderDetailId, SalesOrderID AS salesOrderId,
  ProductID AS productId, OrderQty AS orderQty
FROM salesorderdetail
WHERE CarrierTrackingNumber IS NULL OR CarrierTrackingNumber = ''
ORDER BY SalesOrderDetailID ASC
${limitClause(limit)}`,
        params: [],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productId",
          "orderQty",
        ],
      };
    }
    case "avg_lines_per_order":
      return {
        sql: `SELECT AVG(cnt) AS avgLines
FROM (
  SELECT COUNT(*) AS cnt FROM salesorderdetail GROUP BY SalesOrderID
) t`,
        params: [],
        columns: ["avgLines"],
      };
    case "orders_most_lines": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, COUNT(*) AS lineCount
FROM salesorderdetail
GROUP BY SalesOrderID
ORDER BY lineCount DESC, SalesOrderID ASC
${limitClause(limit)}`,
        params: [],
        columns: ["salesOrderId", "lineCount"],
      };
    }
    case "count_lines_by_special_offer":
      return {
        sql: `SELECT SpecialOfferID AS specialOfferId, COUNT(*) AS lineCount
FROM salesorderdetail
GROUP BY SpecialOfferID
ORDER BY lineCount DESC`,
        params: [],
        columns: ["specialOfferId", "lineCount"],
      };
    case "pct_lines_for_product": {
      const productId = clampInt(f.productId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT
  (SELECT COUNT(*) FROM salesorderdetail WHERE ProductID = ?) * 100.0 /
  NULLIF((SELECT COUNT(*) FROM salesorderdetail), 0) AS pctLines`,
        params: [productId],
        columns: ["pctLines"],
      };
    }
    case "min_line_total":
      return {
        sql: `SELECT MIN(LineTotal) AS minLineTotal FROM salesorderdetail`,
        params: [],
        columns: ["minLineTotal"],
      };
    case "max_line_total":
      return {
        sql: `SELECT MAX(LineTotal) AS maxLineTotal FROM salesorderdetail`,
        params: [],
        columns: ["maxLineTotal"],
      };
    case "list_lines_for_color": {
      const color = asStringFilter(f.color) ?? "Black";
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT d.SalesOrderDetailID AS salesOrderDetailId, d.SalesOrderID AS salesOrderId,
  p.Name AS productName, d.OrderQty AS orderQty, d.LineTotal AS lineTotal
${PRODUCT_JOIN}
WHERE p.Color = ?
ORDER BY d.SalesOrderDetailID ASC
${limitClause(limit)}`,
        params: [color],
        columns: [
          "salesOrderDetailId",
          "salesOrderId",
          "productName",
          "orderQty",
          "lineTotal",
        ],
      };
    }
    case "sum_order_qty_make_flag":
      return {
        sql: `SELECT COALESCE(SUM(d.OrderQty), 0) AS totalQty
${PRODUCT_JOIN}
WHERE p.MakeFlag = 1`,
        params: [],
        columns: ["totalQty"],
      };
    default:
      return null;
  }
}
