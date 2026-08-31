/**
 * sql.ts — salesorderheader SELECT templates (order-level).
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import { clampInt } from "@/query-agent/domain/tables/salesorderheader/extract";

const ORDER_LIST_COLS = `SalesOrderID AS salesOrderId, OrderDate AS orderDate,
  CustomerID AS customerId, TotalDue AS totalDue, Status AS status,
  OnlineOrderFlag AS onlineOrderFlag`;

const yearsFromFilter = (f: Record<string, unknown>): [number, number] | null => {
  const raw = f.years;
  if (Array.isArray(raw) && raw.length >= 2) {
    const a = Number(raw[0]);
    const b = Number(raw[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) return [Math.floor(a), Math.floor(b)];
  }
  return null;
}

export const buildSalesOrderHeaderQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  switch (plan.intent) {
    case "count_sales_orders":
      return {
        sql: `SELECT COUNT(*) AS orderCount FROM salesorderheader`,
        params: [],
        columns: ["orderCount"],
      };
    case "last_sale":
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, OrderDate AS orderDate,
  CustomerID AS customerId, TotalDue AS totalDue
FROM salesorderheader
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT 1`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue"],
      };
    case "first_sale":
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, OrderDate AS orderDate,
  CustomerID AS customerId, TotalDue AS totalDue
FROM salesorderheader
ORDER BY OrderDate ASC, SalesOrderID ASC
LIMIT 1`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue"],
      };
    case "last_sale_due_date":
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, DueDate AS dueDate, OrderDate AS orderDate
FROM salesorderheader
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT 1`,
        params: [],
        columns: ["salesOrderId", "dueDate", "orderDate"],
      };
    case "last_sale_ship_date":
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, ShipDate AS shipDate, OrderDate AS orderDate
FROM salesorderheader
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT 1`,
        params: [],
        columns: ["salesOrderId", "shipDate", "orderDate"],
      };
    case "sales_value_over_period": {
      const months = clampInt(f.lastMonths, 3, 1, 120);
      return {
        sql: `SELECT COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
WHERE OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)`,
        params: [months],
        columns: ["salesValue"],
      };
    }
    case "average_order_value":
      return {
        sql: `SELECT AVG(TotalDue) AS avgOrderValue FROM salesorderheader`,
        params: [],
        columns: ["avgOrderValue"],
      };
    case "average_order_value_online":
      return {
        sql: `SELECT AVG(TotalDue) AS avgOrderValue
FROM salesorderheader
WHERE OnlineOrderFlag = 1`,
        params: [],
        columns: ["avgOrderValue"],
      };
    case "average_order_value_offline":
      return {
        sql: `SELECT AVG(TotalDue) AS avgOrderValue
FROM salesorderheader
WHERE OnlineOrderFlag = 0`,
        params: [],
        columns: ["avgOrderValue"],
      };
    case "average_order_value_over_period": {
      const months = clampInt(f.lastMonths, 3, 1, 120);
      return {
        sql: `SELECT AVG(TotalDue) AS avgOrderValue
FROM salesorderheader
WHERE OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)`,
        params: [months],
        columns: ["avgOrderValue"],
      };
    }
    case "min_order_value":
      return {
        sql: `SELECT MIN(TotalDue) AS minOrderValue FROM salesorderheader`,
        params: [],
        columns: ["minOrderValue"],
      };
    case "max_order_value":
      return {
        sql: `SELECT MAX(TotalDue) AS maxOrderValue FROM salesorderheader`,
        params: [],
        columns: ["maxOrderValue"],
      };
    case "median_order_value":
      // Classic median via ordered subquery + offset (MySQL has no MEDIAN()).
      return {
        sql: `SELECT AVG(mid.TotalDue) AS medianOrderValue
FROM (
  SELECT TotalDue
  FROM salesorderheader
  ORDER BY TotalDue
  LIMIT 2 - (
    SELECT COUNT(*) FROM salesorderheader
  ) % 2
  OFFSET (
    SELECT (COUNT(*) - 1) DIV 2 FROM salesorderheader
  )
) AS mid`,
        params: [],
        columns: ["medianOrderValue"],
      };
    case "variance_order_value":
      return {
        sql: `SELECT VARIANCE(TotalDue) AS varianceOrderValue FROM salesorderheader`,
        params: [],
        columns: ["varianceOrderValue"],
      };
    case "average_freight":
      return {
        sql: `SELECT AVG(Freight) AS avgFreight FROM salesorderheader`,
        params: [],
        columns: ["avgFreight"],
      };
    case "average_tax":
      return {
        sql: `SELECT AVG(TaxAmt) AS avgTax FROM salesorderheader`,
        params: [],
        columns: ["avgTax"],
      };
    case "count_online_orders":
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE OnlineOrderFlag = 1`,
        params: [],
        columns: ["orderCount"],
      };
    case "count_offline_orders":
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE OnlineOrderFlag = 0`,
        params: [],
        columns: ["orderCount"],
      };
    case "pct_online_orders":
      return {
        sql: `SELECT
  CASE WHEN COUNT(*) = 0 THEN 0
  ELSE 100.0 * SUM(CASE WHEN OnlineOrderFlag = 1 THEN 1 ELSE 0 END) / COUNT(*)
  END AS pctOnline
FROM salesorderheader`,
        params: [],
        columns: ["pctOnline"],
      };
    case "total_sales_value":
      return {
        sql: `SELECT COALESCE(SUM(TotalDue), 0) AS salesValue FROM salesorderheader`,
        params: [],
        columns: ["salesValue"],
      };
    case "total_subtotal":
      return {
        sql: `SELECT COALESCE(SUM(SubTotal), 0) AS totalSubTotal FROM salesorderheader`,
        params: [],
        columns: ["totalSubTotal"],
      };
    case "total_tax":
      return {
        sql: `SELECT COALESCE(SUM(TaxAmt), 0) AS totalTax FROM salesorderheader`,
        params: [],
        columns: ["totalTax"],
      };
    case "total_freight":
      return {
        sql: `SELECT COALESCE(SUM(Freight), 0) AS totalFreight FROM salesorderheader`,
        params: [],
        columns: ["totalFreight"],
      };
    case "sales_orders_by_year": {
      const sortKey =
        f.sort === "orderCount" || f.sort === "salesValue" || f.sort === "orderYear"
          ? f.sort
          : "orderYear";
      const sortDir = f.sortDir === "desc" ? "DESC" : "ASC";
      // Allowlisted aliases only — never interpolate free-form user text.
      const orderBy =
        sortKey === "orderCount"
          ? `orderCount ${sortDir}, orderYear ASC`
          : sortKey === "salesValue"
            ? `salesValue ${sortDir}, orderYear ASC`
            : `orderYear ${sortDir}`;
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, COUNT(*) AS orderCount,
  COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
GROUP BY YEAR(OrderDate)
ORDER BY ${orderBy}`,
        params: [],
        columns: ["orderYear", "orderCount", "salesValue"],
      };
    }
    case "sales_value_by_year":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear,
  COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
GROUP BY YEAR(OrderDate)
ORDER BY orderYear ASC`,
        params: [],
        columns: ["orderYear", "salesValue"],
      };
    case "sales_value_by_month":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, MONTH(OrderDate) AS orderMonth,
  COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
GROUP BY YEAR(OrderDate), MONTH(OrderDate)
ORDER BY orderYear ASC, orderMonth ASC`,
        params: [],
        columns: ["orderYear", "orderMonth", "salesValue"],
      };
    case "sales_orders_by_month":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, MONTH(OrderDate) AS orderMonth,
  COUNT(*) AS orderCount
FROM salesorderheader
GROUP BY YEAR(OrderDate), MONTH(OrderDate)
ORDER BY orderYear ASC, orderMonth ASC`,
        params: [],
        columns: ["orderYear", "orderMonth", "orderCount"],
      };
    case "sales_orders_by_status":
      return {
        sql: `SELECT Status AS status, COUNT(*) AS orderCount
FROM salesorderheader
GROUP BY Status
ORDER BY status ASC`,
        params: [],
        columns: ["status", "orderCount"],
      };
    case "sales_value_by_status":
      return {
        sql: `SELECT Status AS status, COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
GROUP BY Status
ORDER BY status ASC`,
        params: [],
        columns: ["status", "salesValue"],
      };
    case "sales_orders_by_territory":
      return {
        sql: `SELECT TerritoryID AS territoryId, COUNT(*) AS orderCount
FROM salesorderheader
GROUP BY TerritoryID
ORDER BY orderCount DESC, territoryId ASC`,
        params: [],
        columns: ["territoryId", "orderCount"],
      };
    case "avg_order_value_by_year":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, AVG(TotalDue) AS avgOrderValue
FROM salesorderheader
GROUP BY YEAR(OrderDate)
ORDER BY orderYear ASC`,
        params: [],
        columns: ["orderYear", "avgOrderValue"],
      };
    case "avg_order_value_by_territory":
      return {
        sql: `SELECT TerritoryID AS territoryId, AVG(TotalDue) AS avgOrderValue
FROM salesorderheader
GROUP BY TerritoryID
ORDER BY territoryId ASC`,
        params: [],
        columns: ["territoryId", "avgOrderValue"],
      };
    case "count_orders_by_year": {
      const year = clampInt(f.year, 2013, 1900, 2100);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE YEAR(OrderDate) = ?`,
        params: [year],
        columns: ["orderCount"],
      };
    }
    case "sales_value_in_year": {
      const year = clampInt(f.year, 2013, 1900, 2100);
      return {
        sql: `SELECT COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
WHERE YEAR(OrderDate) = ?`,
        params: [year],
        columns: ["salesValue"],
      };
    }
    case "compare_sales_years": {
      const pair = yearsFromFilter(f);
      const y1 = pair?.[0] ?? 2013;
      const y2 = pair?.[1] ?? 2014;
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear,
  COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
WHERE YEAR(OrderDate) IN (?, ?)
GROUP BY YEAR(OrderDate)
ORDER BY orderYear ASC`,
        params: [y1, y2],
        columns: ["orderYear", "salesValue"],
      };
    }
    case "count_orders_last_days": {
      const days = clampInt(f.lastDays, 30, 1, 3650);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE OrderDate >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
        params: [days],
        columns: ["orderCount"],
      };
    }
    case "list_orders_last_days": {
      const days = clampInt(f.lastDays, 7, 1, 3650);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE OrderDate >= DATE_SUB(NOW(), INTERVAL ? DAY)
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [days],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "count_orders_for_customer": {
      const customerId = clampInt(f.customerId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE CustomerID = ?`,
        params: [customerId],
        columns: ["orderCount"],
      };
    }
    case "list_orders_for_customer": {
      const customerId = clampInt(f.customerId, 0, 1, 2_147_483_647);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE CustomerID = ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [customerId],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "count_orders_for_salesperson": {
      const salesPersonId = clampInt(f.salesPersonId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE SalesPersonID = ?`,
        params: [salesPersonId],
        columns: ["orderCount"],
      };
    }
    case "list_orders_for_salesperson": {
      const salesPersonId = clampInt(f.salesPersonId, 0, 1, 2_147_483_647);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE SalesPersonID = ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [salesPersonId],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "order_by_id": {
      const salesOrderId = clampInt(f.salesOrderId, 0, 1, 2_147_483_647);
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, OrderDate AS orderDate,
  DueDate AS dueDate, ShipDate AS shipDate, Status AS status,
  OnlineOrderFlag AS onlineOrderFlag, CustomerID AS customerId,
  SalesPersonID AS salesPersonId, TerritoryID AS territoryId,
  PurchaseOrderNumber AS purchaseOrderNumber, Comment AS comment,
  SubTotal AS subTotal, TaxAmt AS taxAmt, Freight AS freight,
  TotalDue AS totalDue
FROM salesorderheader
WHERE SalesOrderID = ?
LIMIT 1`,
        params: [salesOrderId],
        columns: [
          "salesOrderId",
          "orderDate",
          "dueDate",
          "shipDate",
          "status",
          "onlineOrderFlag",
          "customerId",
          "salesPersonId",
          "territoryId",
          "purchaseOrderNumber",
          "comment",
          "subTotal",
          "taxAmt",
          "freight",
          "totalDue",
        ],
      };
    }
    case "top_orders_by_value": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
ORDER BY TotalDue DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "lowest_orders_by_value": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
ORDER BY TotalDue ASC, SalesOrderID ASC
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "list_orders_min_value": {
      const minTotalDue = Number(f.minTotalDue);
      const min = Number.isFinite(minTotalDue) ? minTotalDue : 0;
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE TotalDue > ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [min],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "list_orders_max_value": {
      const maxTotalDue = Number(f.maxTotalDue);
      const max = Number.isFinite(maxTotalDue) ? maxTotalDue : 100;
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE TotalDue < ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [max],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "count_orders_with_po":
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE PurchaseOrderNumber IS NOT NULL AND PurchaseOrderNumber <> ''`,
        params: [],
        columns: ["orderCount"],
      };
    case "count_orders_without_comment":
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE Comment IS NULL OR Comment = ''`,
        params: [],
        columns: ["orderCount"],
      };
    case "list_orders_with_comments": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT SalesOrderID AS salesOrderId, OrderDate AS orderDate,
  CustomerID AS customerId, TotalDue AS totalDue, Comment AS comment
FROM salesorderheader
WHERE Comment IS NOT NULL AND Comment <> ''
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "comment"],
      };
    }
    case "count_orders_shipped_period": {
      const months = clampInt(f.lastMonths, 3, 1, 120);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE ShipDate IS NOT NULL
  AND ShipDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)`,
        params: [months],
        columns: ["orderCount"],
      };
    }
    case "latest_orders": {
      const limit = clampInt(f.limit, 20, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "oldest_orders": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
ORDER BY OrderDate ASC, SalesOrderID ASC
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "count_orders_by_status": {
      const status = clampInt(f.status, 0, 0, 255);
      return {
        sql: `SELECT COUNT(*) AS orderCount
FROM salesorderheader
WHERE Status = ?`,
        params: [status],
        columns: ["orderCount"],
      };
    }
    case "list_orders_by_status": {
      const status = clampInt(f.status, 0, 0, 255);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE Status = ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [status],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "sample_orders": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
ORDER BY RAND()
LIMIT ${limit}`,
        params: [],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "list_orders_year_range": {
      const minYear = clampInt(f.minYear, 2013, 1900, 2100);
      const maxYear = clampInt(f.maxYear, 2014, 1900, 2100);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT ${ORDER_LIST_COLS}
FROM salesorderheader
WHERE YEAR(OrderDate) BETWEEN ? AND ?
ORDER BY OrderDate DESC, SalesOrderID DESC
LIMIT ${limit}`,
        params: [minYear, maxYear],
        columns: ["salesOrderId", "orderDate", "customerId", "totalDue", "status", "onlineOrderFlag"],
      };
    }
    case "top_year_by_order_count":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, COUNT(*) AS orderCount
FROM salesorderheader
GROUP BY YEAR(OrderDate)
ORDER BY orderCount DESC, orderYear ASC
LIMIT 1`,
        params: [],
        columns: ["orderYear", "orderCount"],
      };
    case "top_year_by_sales_value":
      return {
        sql: `SELECT YEAR(OrderDate) AS orderYear, COALESCE(SUM(TotalDue), 0) AS salesValue
FROM salesorderheader
GROUP BY YEAR(OrderDate)
ORDER BY salesValue DESC, orderYear ASC
LIMIT 1`,
        params: [],
        columns: ["orderYear", "salesValue"],
      };
    case "count_distinct_customers_with_orders":
      return {
        sql: `SELECT COUNT(DISTINCT CustomerID) AS customerCount
FROM salesorderheader`,
        params: [],
        columns: ["customerCount"],
      };
    default:
      return null;
  }
}
