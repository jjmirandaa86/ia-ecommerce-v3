/**
 * sql.ts — mixed join SELECT templates (product × sales × customer/contact).
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import { clampInt } from "@/query-agent/domain/tables/mixed/extract";

const CONTACT_NAME_EXPR = `NULLIF(TRIM(CONCAT_WS(' ',
  NULLIF(TRIM(COALESCE(ct.Title, '')), ''),
  NULLIF(TRIM(COALESCE(ct.FirstName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.MiddleName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.LastName, '')), ''),
  NULLIF(TRIM(COALESCE(ct.Suffix, '')), '')
)), '')`;

export function buildMixedQuery(plan: QueryPlan): BuiltQuery | null {
  const f = plan.filters;
  switch (plan.intent) {
    case "products_sold_to_named_customers": {
      const productNeedle = String(f.productNameContains ?? "").trim();
      const customerNeedle = String(f.customerNameContains ?? "").trim();
      if (!productNeedle || !customerNeedle) return null;

      const parts = [
        "LOWER(p.Name) LIKE ?",
        `(LOWER(ct.FirstName) LIKE ? OR LOWER(ct.LastName) LIKE ? OR LOWER(CONCAT_WS(' ', ct.FirstName, ct.MiddleName, ct.LastName)) LIKE ?)`,
      ];
      const pProd = `%${productNeedle.toLowerCase()}%`;
      const pCust = `%${customerNeedle.toLowerCase()}%`;
      const params: unknown[] = [pProd, pCust, pCust, pCust];

      if (f.lastMonths != null) {
        parts.push("h.OrderDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)");
        params.push(clampInt(f.lastMonths, 24, 1, 120));
      }
      if (f.category != null) {
        parts.push("pc.Name = ?");
        params.push(String(f.category));
      }

      const limit = clampInt(f.limit, 25, 1, 100);
      params.push(limit);

      const categoryJoin =
        f.category != null
          ? `
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`
          : "";

      return {
        sql: `SELECT p.ProductID AS productId, p.Name AS productName, p.ListPrice AS listPrice,
  p.Color AS color, d.OrderQty AS orderQty, d.LineTotal AS lineTotal,
  h.SalesOrderID AS salesOrderId, h.OrderDate AS orderDate, h.TotalDue AS totalDue,
  c.CustomerID AS customerId, c.AccountNumber AS accountNumber,
  ${CONTACT_NAME_EXPR} AS customerName,
  ct.EmailAddress AS emailAddress, ct.Phone AS phone
FROM product p
INNER JOIN salesorderdetail d ON d.ProductID = p.ProductID
INNER JOIN salesorderheader h ON h.SalesOrderID = d.SalesOrderID
INNER JOIN customer c ON c.CustomerID = h.CustomerID
INNER JOIN individual i ON i.CustomerID = c.CustomerID
INNER JOIN contact ct ON ct.ContactID = i.ContactID${categoryJoin}
WHERE ${parts.join(" AND ")}
ORDER BY h.OrderDate DESC, h.SalesOrderID DESC
LIMIT ?`,
        params,
        columns: [
          "productId",
          "productName",
          "listPrice",
          "color",
          "orderQty",
          "lineTotal",
          "salesOrderId",
          "orderDate",
          "totalDue",
          "customerId",
          "accountNumber",
          "customerName",
          "emailAddress",
          "phone",
        ],
      };
    }
    default:
      return null;
  }
}
