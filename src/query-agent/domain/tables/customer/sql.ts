/**
 * sql.ts — customer SELECT templates.
 * Joins: individual+contact for person fields; salesorderheader for spend;
 * detail+product+category for category spend.
 * Contact: Title/First/Middle/Last/Suffix, EmailAddress, EmailPromotion, Phone.
 * Never select PasswordHash / PasswordSalt.
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import { clampInt } from "@/query-agent/domain/tables/customer/extract";

/** Display name from contact name parts (Title … Suffix). */
const CONTACT_NAME_EXPR = `NULLIF(TRIM(CONCAT_WS(' ',
  NULLIF(TRIM(COALESCE(ct.Title, '')), ''),
  NULLIF(TRIM(COALESCE(ct.FirstName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.MiddleName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.LastName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.Suffix, '')), '')
)), '')`;

/** Full safe contact projection (no password columns). */
const CUSTOMER_CONTACT_SELECT = `${CONTACT_NAME_EXPR} AS customerName,
  ct.ContactID AS contactId,
  ct.Title AS title,
  ct.FirstName AS firstName,
  ct.MiddleName AS middleName,
  ct.LastName AS lastName,
  ct.Suffix AS suffix,
  ct.EmailAddress AS emailAddress,
  ct.EmailPromotion AS emailPromotion,
  ct.Phone AS phone,
  ct.ModifiedDate AS contactModifiedDate`;

/** For GROUP BY rankings — aggregate contact fields. */
const CUSTOMER_CONTACT_AGG = `MAX(${CONTACT_NAME_EXPR}) AS customerName,
  MAX(ct.ContactID) AS contactId,
  MAX(ct.Title) AS title,
  MAX(ct.FirstName) AS firstName,
  MAX(ct.MiddleName) AS middleName,
  MAX(ct.LastName) AS lastName,
  MAX(ct.Suffix) AS suffix,
  MAX(ct.EmailAddress) AS emailAddress,
  MAX(ct.EmailPromotion) AS emailPromotion,
  MAX(ct.Phone) AS phone`;

const CONTACT_COLUMNS = [
  "customerName",
  "contactId",
  "title",
  "firstName",
  "middleName",
  "lastName",
  "suffix",
  "emailAddress",
  "emailPromotion",
  "phone",
  "contactModifiedDate",
] as const;

const CONTACT_AGG_COLUMNS = [
  "customerName",
  "contactId",
  "title",
  "firstName",
  "middleName",
  "lastName",
  "suffix",
  "emailAddress",
  "emailPromotion",
  "phone",
] as const;

const CUSTOMER_CONTACT_JOINS = `
LEFT JOIN individual i ON i.CustomerID = c.CustomerID
LEFT JOIN contact ct ON ct.ContactID = i.ContactID`;

const CUSTOMER_CONTACT_INNER = `
INNER JOIN individual i ON i.CustomerID = c.CustomerID
INNER JOIN contact ct ON ct.ContactID = i.ContactID`;


export const buildCustomerQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  switch (plan.intent) {
    case "count_customers":
      return {
        sql: `SELECT COUNT(*) AS customerCount FROM customer`,
        params: [],
        columns: ["customerCount"],
      };
    case "count_store_customers":
      return {
        sql: `SELECT COUNT(*) AS customerCount FROM customer WHERE CustomerType = 'S'`,
        params: [],
        columns: ["customerCount"],
      };
    case "count_individual_customers":
      return {
        sql: `SELECT COUNT(*) AS customerCount FROM customer WHERE CustomerType = 'I'`,
        params: [],
        columns: ["customerCount"],
      };
    case "count_customers_by_type": {
      const t = String(f.customerType ?? "S");
      return {
        sql: `SELECT COUNT(*) AS customerCount FROM customer WHERE CustomerType = ?`,
        params: [t],
        columns: ["customerCount"],
      };
    }
    case "customers_by_type":
      return {
        sql: `SELECT CustomerType AS customerType, COUNT(*) AS customerCount
FROM customer
GROUP BY CustomerType
ORDER BY customerCount DESC`,
        params: [],
        columns: ["customerType", "customerCount"],
      };
    case "count_customers_by_territory": {
      const tid = clampInt(f.territoryId, 1, 1, 999);
      return {
        sql: `SELECT COUNT(*) AS customerCount FROM customer WHERE TerritoryID = ?`,
        params: [tid],
        columns: ["customerCount"],
      };
    }
    case "customers_by_territory":
      return {
        sql: `SELECT COALESCE(TerritoryID, 0) AS territoryId, COUNT(*) AS customerCount
FROM customer
GROUP BY TerritoryID
ORDER BY customerCount DESC`,
        params: [],
        columns: ["territoryId", "customerCount"],
      };
    case "customer_count_by_territory_type":
      return {
        sql: `SELECT COALESCE(TerritoryID, 0) AS territoryId, CustomerType AS customerType,
  COUNT(*) AS customerCount
FROM customer
GROUP BY TerritoryID, CustomerType
ORDER BY territoryId ASC, customerType ASC`,
        params: [],
        columns: ["territoryId", "customerType", "customerCount"],
      };
    case "customer_by_id": {
      const id = clampInt(f.customerId, 0, 1, 2_000_000);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, c.TerritoryID AS territoryId, c.ModifiedDate AS modifiedDate,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE c.CustomerID = ?`,
        params: [id],
        columns: ["customerId", "accountNumber", "customerType", "territoryId", "modifiedDate", ...CONTACT_COLUMNS],
      };
    }
    case "customer_by_account":
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, c.TerritoryID AS territoryId,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE c.AccountNumber = ?`,
        params: [String(f.accountNumber ?? "")],
        columns: ["customerId", "accountNumber", "customerType", "territoryId", ...CONTACT_COLUMNS],
      };
    case "customers_by_name": {
      const parts: string[] = [];
      const params: unknown[] = [];
      if (f.nameContains != null) {
        const p = `%${String(f.nameContains).toLowerCase()}%`;
        parts.push(
          `(LOWER(ct.FirstName) LIKE ? OR LOWER(ct.LastName) LIKE ? OR LOWER(CONCAT_WS(' ', ct.FirstName, ct.MiddleName, ct.LastName)) LIKE ?)`,
        );
        params.push(p, p, p);
      }
      if (f.firstName != null) {
        parts.push("LOWER(ct.FirstName) = LOWER(?)");
        params.push(String(f.firstName));
      }
      if (f.lastName != null) {
        parts.push("LOWER(ct.LastName) = LOWER(?)");
        params.push(String(f.lastName));
      }
      if (f.email != null) {
        parts.push("LOWER(ct.EmailAddress) = LOWER(?)");
        params.push(String(f.email));
      }
      if (f.phone != null) {
        parts.push("REPLACE(ct.Phone, '-', '') = REPLACE(?, '-', '')");
        params.push(String(f.phone));
      }
      if (!parts.length) return null;
      const limit = clampInt(f.limit, 25, 1, 100);
      params.push(limit);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, c.TerritoryID AS territoryId,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_INNER}
WHERE ${parts.join(" AND ")}
ORDER BY c.CustomerID ASC
LIMIT ?`,
        params,
        columns: ["customerId", "accountNumber", "customerType", "territoryId", ...CONTACT_COLUMNS],
      };
    }
    case "count_customers_by_name": {
      const parts: string[] = [];
      const params: unknown[] = [];
      if (f.nameContains != null) {
        const p = `%${String(f.nameContains).toLowerCase()}%`;
        parts.push(
          `(LOWER(ct.FirstName) LIKE ? OR LOWER(ct.LastName) LIKE ? OR LOWER(CONCAT_WS(' ', ct.FirstName, ct.MiddleName, ct.LastName)) LIKE ?)`,
        );
        params.push(p, p, p);
      }
      if (f.firstName != null) {
        parts.push("LOWER(ct.FirstName) = LOWER(?)");
        params.push(String(f.firstName));
      }
      if (f.lastName != null) {
        parts.push("LOWER(ct.LastName) = LOWER(?)");
        params.push(String(f.lastName));
      }
      if (f.email != null) {
        parts.push("LOWER(ct.EmailAddress) = LOWER(?)");
        params.push(String(f.email));
      }
      if (f.phone != null) {
        parts.push("REPLACE(ct.Phone, '-', '') = REPLACE(?, '-', '')");
        params.push(String(f.phone));
      }
      if (!parts.length) return null;
      return {
        sql: `SELECT COUNT(*) AS customerCount
FROM customer c${CUSTOMER_CONTACT_INNER}
WHERE ${parts.join(" AND ")}`,
        params,
        columns: ["customerCount"],
      };
    }
    case "orders_for_customers_by_name": {
      const parts: string[] = [];
      const params: unknown[] = [];
      if (f.nameContains != null) {
        const p = `%${String(f.nameContains).toLowerCase()}%`;
        parts.push(
          `(LOWER(ct.FirstName) LIKE ? OR LOWER(ct.LastName) LIKE ? OR LOWER(CONCAT_WS(' ', ct.FirstName, ct.MiddleName, ct.LastName)) LIKE ?)`,
        );
        params.push(p, p, p);
      }
      if (f.firstName != null) {
        parts.push("LOWER(ct.FirstName) = LOWER(?)");
        params.push(String(f.firstName));
      }
      if (f.lastName != null) {
        parts.push("LOWER(ct.LastName) = LOWER(?)");
        params.push(String(f.lastName));
      }
      if (f.email != null) {
        parts.push("LOWER(ct.EmailAddress) = LOWER(?)");
        params.push(String(f.email));
      }
      if (f.phone != null) {
        parts.push("REPLACE(ct.Phone, '-', '') = REPLACE(?, '-', '')");
        params.push(String(f.phone));
      }
      if (!parts.length) return null;
      if (f.lastMonths != null) {
        parts.push("h.OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)");
        params.push(clampInt(f.lastMonths, 12, 1, 120));
      }
      const limit = clampInt(f.limit, 25, 1, 100);
      params.push(limit);
      return {
        sql: `SELECT h.SalesOrderID AS salesOrderId, h.OrderDate AS orderDate,
  h.TotalDue AS totalDue, h.Status AS status,
  c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_INNER}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
WHERE ${parts.join(" AND ")}
ORDER BY h.OrderDate DESC, h.SalesOrderID DESC
LIMIT ?`,
        params,
        columns: [
          "salesOrderId",
          "orderDate",
          "totalDue",
          "status",
          "customerId",
          "accountNumber",
          ...CONTACT_COLUMNS,
        ],
      };
    }
    case "list_customers": {
      const parts = ["1=1"];
      const params: unknown[] = [];
      if (f.customerType != null) {
        parts.push("c.CustomerType = ?");
        params.push(String(f.customerType));
      }
      if (f.territoryId != null) {
        parts.push("c.TerritoryID = ?");
        params.push(clampInt(f.territoryId, 1, 1, 999));
      }
      const limit = clampInt(f.limit, 25, 1, 100);
      params.push(limit);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, c.TerritoryID AS territoryId,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE ${parts.join(" AND ")}
ORDER BY c.CustomerID ASC
LIMIT ?`,
        params,
        columns: ["customerId", "accountNumber", "customerType", "territoryId", ...CONTACT_COLUMNS],
      };
    }
    case "sample_customers": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
ORDER BY RAND()
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "customerType", ...CONTACT_COLUMNS],
      };
    }
    case "random_sample_store_customers": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE c.CustomerType = 'S'
ORDER BY RAND()
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", ...CONTACT_COLUMNS],
      };
    }
    case "latest_customers": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.ModifiedDate AS modifiedDate, ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
ORDER BY c.ModifiedDate DESC, c.CustomerID DESC
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "modifiedDate", ...CONTACT_COLUMNS],
      };
    }
    case "oldest_customers": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.ModifiedDate AS modifiedDate, ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
ORDER BY c.ModifiedDate ASC, c.CustomerID ASC
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "modifiedDate", ...CONTACT_COLUMNS],
      };
    }
    case "customers_modified_after": {
      const year = clampInt(f.year, 2005, 1900, 2100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.ModifiedDate AS modifiedDate, ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE YEAR(c.ModifiedDate) > ?
ORDER BY c.ModifiedDate ASC
LIMIT 50`,
        params: [year],
        columns: ["customerId", "accountNumber", "modifiedDate", ...CONTACT_COLUMNS],
      };
    }
    case "count_customers_with_orders":
      return {
        sql: `SELECT COUNT(DISTINCT c.CustomerID) AS customerCount
FROM customer c
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID`,
        params: [],
        columns: ["customerCount"],
      };
    case "count_customers_without_orders":
      return {
        sql: `SELECT COUNT(*) AS customerCount
FROM customer c
WHERE NOT EXISTS (
  SELECT 1 FROM salesorderheader h WHERE h.CustomerID = c.CustomerID
)`,
        params: [],
        columns: ["customerCount"],
      };
    case "pct_customers_with_orders":
      return {
        sql: `SELECT
  (SELECT COUNT(DISTINCT CustomerID) FROM salesorderheader) * 100.0 /
  NULLIF((SELECT COUNT(*) FROM customer), 0) AS pctWithOrders`,
        params: [],
        columns: ["pctWithOrders"],
      };
    case "pct_customers_by_type":
      return {
        sql: `SELECT CustomerType AS customerType,
  COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM customer), 0) AS pctCustomers
FROM customer
GROUP BY CustomerType
ORDER BY customerType ASC`,
        params: [],
        columns: ["customerType", "pctCustomers"],
      };
    case "list_customers_with_orders": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, ${CUSTOMER_CONTACT_AGG}
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber, c.CustomerType
ORDER BY c.CustomerID ASC
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "customerType", ...CONTACT_AGG_COLUMNS],
      };
    }
    case "list_customers_without_orders": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, ${CUSTOMER_CONTACT_SELECT}
FROM customer c${CUSTOMER_CONTACT_JOINS}
WHERE NOT EXISTS (
  SELECT 1 FROM salesorderheader h WHERE h.CustomerID = c.CustomerID
)
ORDER BY c.CustomerID ASC
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "customerType", ...CONTACT_COLUMNS],
      };
    }
    case "top_customers_by_sales":
    case "lowest_customers_by_sales":
    case "top_account_numbers_by_sales": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent !== "lowest_customers_by_sales";
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  c.CustomerType AS customerType, ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue,
  COUNT(h.SalesOrderID) AS orderCount
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber, c.CustomerType
ORDER BY salesValue ${desc ? "DESC" : "ASC"}
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", "customerType", ...CONTACT_AGG_COLUMNS, "salesValue", "orderCount"],
      };
    }
    case "top_customers_by_order_count":
    case "lowest_customers_by_order_count": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent === "top_customers_by_order_count";
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COUNT(h.SalesOrderID) AS orderCount,
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber
ORDER BY orderCount ${desc ? "DESC" : "ASC"}
LIMIT ${limit}`,
        params: [],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "orderCount", "salesValue"],
      };
    }
    case "customers_by_category_spend": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const cat = String(f.category ?? "Bikes");
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(d.LineTotal), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
INNER JOIN salesorderdetail d ON d.SalesOrderID = h.SalesOrderID
INNER JOIN product p ON p.ProductID = d.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE pc.Name = ?
GROUP BY c.CustomerID, c.AccountNumber
ORDER BY salesValue DESC
LIMIT ${limit}`,
        params: [cat],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "top_customers_by_sales_period": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const months = clampInt(f.lastMonths, 12, 1, 120);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
WHERE h.OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)
GROUP BY c.CustomerID, c.AccountNumber
ORDER BY salesValue DESC
LIMIT ${limit}`,
        params: [months],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "top_customers_by_sales_type": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const t = String(f.customerType ?? "S");
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
WHERE c.CustomerType = ?
GROUP BY c.CustomerID, c.AccountNumber
ORDER BY salesValue DESC
LIMIT ${limit}`,
        params: [t],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "top_customers_by_sales_territory": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const tid = clampInt(f.territoryId, 1, 1, 999);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
WHERE c.TerritoryID = ?
GROUP BY c.CustomerID, c.AccountNumber
ORDER BY salesValue DESC
LIMIT ${limit}`,
        params: [tid],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "avg_customer_spend":
      return {
        sql: `SELECT AVG(t.salesValue) AS avgSpend
FROM (
  SELECT COALESCE(SUM(h.TotalDue), 0) AS salesValue
  FROM customer c
  INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
  GROUP BY c.CustomerID
) t`,
        params: [],
        columns: ["avgSpend"],
      };
    case "median_customer_spend":
      return {
        sql: `SELECT AVG(mid.salesValue) AS medianSpend
FROM (
  SELECT salesValue FROM (
    SELECT COALESCE(SUM(h.TotalDue), 0) AS salesValue
    FROM customer c
    INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
    GROUP BY c.CustomerID
  ) s
  ORDER BY salesValue
  LIMIT 2 - (
    SELECT COUNT(*) FROM (
      SELECT c.CustomerID
      FROM customer c
      INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
      GROUP BY c.CustomerID
    ) x
  ) % 2
  OFFSET (
    SELECT (COUNT(*) - 1) DIV 2 FROM (
      SELECT c.CustomerID
      FROM customer c
      INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
      GROUP BY c.CustomerID
    ) y
  )
) AS mid`,
        params: [],
        columns: ["medianSpend"],
      };
    case "sum_customer_spend":
      return {
        sql: `SELECT COALESCE(SUM(h.TotalDue), 0) AS sumSpend
FROM salesorderheader h`,
        params: [],
        columns: ["sumSpend"],
      };
    case "max_customer_spend":
      return {
        sql: `SELECT MAX(t.salesValue) AS maxSpend
FROM (
  SELECT COALESCE(SUM(h.TotalDue), 0) AS salesValue
  FROM salesorderheader h
  GROUP BY h.CustomerID
) t`,
        params: [],
        columns: ["maxSpend"],
      };
    case "min_customer_spend":
      return {
        sql: `SELECT MIN(t.salesValue) AS minSpend
FROM (
  SELECT COALESCE(SUM(h.TotalDue), 0) AS salesValue
  FROM salesorderheader h
  GROUP BY h.CustomerID
) t`,
        params: [],
        columns: ["minSpend"],
      };
    case "variance_customer_spend":
      return {
        sql: `SELECT VARIANCE(t.salesValue) AS varianceSpend
FROM (
  SELECT COALESCE(SUM(h.TotalDue), 0) AS salesValue
  FROM salesorderheader h
  GROUP BY h.CustomerID
) t`,
        params: [],
        columns: ["varianceSpend"],
      };
    case "avg_orders_per_customer":
      return {
        sql: `SELECT AVG(t.orderCount) AS avgOrders
FROM (
  SELECT COUNT(*) AS orderCount
  FROM salesorderheader
  GROUP BY CustomerID
) t`,
        params: [],
        columns: ["avgOrders"],
      };
    case "customer_spend_for_id": {
      const id = clampInt(f.customerId, 0, 1, 2_000_000);
      return {
        sql: `SELECT COALESCE(SUM(TotalDue), 0) AS salesValue,
  COUNT(*) AS orderCount
FROM salesorderheader
WHERE CustomerID = ?`,
        params: [id],
        columns: ["salesValue", "orderCount"],
      };
    }
    case "customer_order_count_for_id": {
      const id = clampInt(f.customerId, 0, 1, 2_000_000);
      return {
        sql: `SELECT COUNT(*) AS orderCount FROM salesorderheader WHERE CustomerID = ?`,
        params: [id],
        columns: ["orderCount"],
      };
    }
    case "customers_spend_over": {
      const minSpend = Number(f.minSpend ?? 0);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber
HAVING COALESCE(SUM(h.TotalDue), 0) > ?
ORDER BY salesValue DESC
LIMIT ${limit}`,
        params: [minSpend],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "customers_spend_under": {
      const maxSpend = Number(f.maxSpend ?? 0);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COALESCE(SUM(h.TotalDue), 0) AS salesValue
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber
HAVING COALESCE(SUM(h.TotalDue), 0) < ?
ORDER BY salesValue ASC
LIMIT ${limit}`,
        params: [maxSpend],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "salesValue"],
      };
    }
    case "customers_with_min_orders": {
      const minOrders = clampInt(f.minOrders, 2, 1, 1000);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CUSTOMER_CONTACT_AGG},
  COUNT(h.SalesOrderID) AS orderCount
FROM customer c${CUSTOMER_CONTACT_JOINS}
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.AccountNumber
HAVING COUNT(h.SalesOrderID) >= ?
ORDER BY orderCount DESC
LIMIT ${limit}`,
        params: [minOrders],
        columns: ["customerId", "accountNumber", ...CONTACT_AGG_COLUMNS, "orderCount"],
      };
    }
    case "avg_spend_by_type":
      return {
        sql: `SELECT c.CustomerType AS customerType, AVG(t.salesValue) AS avgSpend
FROM customer c
INNER JOIN (
  SELECT CustomerID, COALESCE(SUM(TotalDue), 0) AS salesValue
  FROM salesorderheader
  GROUP BY CustomerID
) t ON t.CustomerID = c.CustomerID
GROUP BY c.CustomerType
ORDER BY avgSpend DESC`,
        params: [],
        columns: ["customerType", "avgSpend"],
      };
    case "avg_spend_by_territory":
      return {
        sql: `SELECT COALESCE(c.TerritoryID, 0) AS territoryId, AVG(t.salesValue) AS avgSpend
FROM customer c
INNER JOIN (
  SELECT CustomerID, COALESCE(SUM(TotalDue), 0) AS salesValue
  FROM salesorderheader
  GROUP BY CustomerID
) t ON t.CustomerID = c.CustomerID
GROUP BY c.TerritoryID
ORDER BY avgSpend DESC`,
        params: [],
        columns: ["territoryId", "avgSpend"],
      };
    case "compare_customer_types_spend":
      return {
        sql: `SELECT c.CustomerType AS customerType,
  COALESCE(SUM(h.TotalDue), 0) AS salesValue,
  COUNT(DISTINCT c.CustomerID) AS customerCount
FROM customer c
INNER JOIN salesorderheader h ON h.CustomerID = c.CustomerID
GROUP BY c.CustomerType
ORDER BY salesValue DESC`,
        params: [],
        columns: ["customerType", "salesValue", "customerCount"],
      };
    default:
      return null;
  }
}
