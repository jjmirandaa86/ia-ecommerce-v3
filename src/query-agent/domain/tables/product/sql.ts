/**
 * sql.ts — Product SELECT templates (rule engine).
 * Builds allowlisted SQL from a QueryPlan.
 * Filter values from NL go in params (?); never concatenate user text.
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import {
  asStringFilter,
  clampInt,
  clampPrice,
  normalizeColor,
} from "@/query-agent/domain/tables/shared";

type WhereAccum = { parts: string[]; params: unknown[] };

const pushCategoryJoin = (filters: Record<string, unknown>): {
  joins: string;
  where: string;
  params: unknown[];
} | null => {
  const category = asStringFilter(filters.category);
  if (!category) return null;
  return {
    joins: `INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`,
    where: "pc.Name = ?",
    params: [category],
  };
}

const buildListProductsQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  const where: WhereAccum = { parts: ["1=1"], params: [] };
  let from = "product p";
  let joins = "";
  let needsAlias = false;

  const cat = pushCategoryJoin(f);
  const subcategory = asStringFilter(f.subcategory);
  if (cat || subcategory) {
    needsAlias = true;
    joins = `INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID`;
    if (cat) {
      joins += `
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`;
      where.parts.push("pc.Name = ?");
      where.params.push(...cat.params);
    }
    if (subcategory) {
      where.parts.push("ps.Name = ?");
      where.params.push(subcategory);
    }
  }

  // Default: exclude zero price unless explicitly asking zero / finished-goods flags only
  const includeZero =
    f.finishedGoodsFlag != null ||
    f.makeFlag != null ||
    f.minDaysToManufacture != null ||
    f.minReorderPoint != null ||
    f.sellStartYear != null ||
    f.nameContains != null ||
    f.productNumberPrefix != null ||
    f.productLine != null ||
    f.size != null;

  if (!includeZero) {
    where.parts.push(needsAlias ? "p.ListPrice > 0" : "ListPrice > 0");
  }

  if (f.maxPrice != null) {
    where.parts.push(needsAlias ? "p.ListPrice < ?" : "ListPrice < ?");
    where.params.push(clampPrice(f.maxPrice, 40));
  }
  if (f.minPrice != null) {
    where.parts.push(needsAlias ? "p.ListPrice > ?" : "ListPrice > ?");
    where.params.push(clampPrice(f.minPrice, 1));
  }

  const boundColor = normalizeColor(f.color);
  if (boundColor) {
    where.parts.push(needsAlias ? "p.Color = ?" : "Color = ?");
    where.params.push(boundColor);
  }

  if (Array.isArray(f.colors) && f.colors.length > 0) {
    const colors = f.colors
      .map((c) => normalizeColor(c))
      .filter((c): c is string => !!c);
    if (colors.length) {
      where.parts.push(
        `${needsAlias ? "p.Color" : "Color"} IN (${colors.map(() => "?").join(",")})`,
      );
      where.params.push(...colors);
    }
  }

  const size = asStringFilter(f.size);
  if (size) {
    where.parts.push(needsAlias ? "p.Size = ?" : "Size = ?");
    where.params.push(size);
  }

  if (f.finishedGoodsFlag === false || f.finishedGoodsFlag === 0) {
    where.parts.push(
      needsAlias ? "p.FinishedGoodsFlag = 0" : "FinishedGoodsFlag = 0",
    );
  } else if (f.finishedGoodsFlag === true || f.finishedGoodsFlag === 1) {
    where.parts.push(
      needsAlias ? "p.FinishedGoodsFlag = 1" : "FinishedGoodsFlag = 1",
    );
  }

  if (f.makeFlag === true || f.makeFlag === 1) {
    where.parts.push(needsAlias ? "p.MakeFlag = 1" : "MakeFlag = 1");
  }

  if (f.minDaysToManufacture != null) {
    where.parts.push(
      needsAlias ? "p.DaysToManufacture > ?" : "DaysToManufacture > ?",
    );
    where.params.push(clampInt(f.minDaysToManufacture, 3, 0, 1000));
  }

  if (f.minReorderPoint != null) {
    where.parts.push(needsAlias ? "p.ReorderPoint > ?" : "ReorderPoint > ?");
    where.params.push(clampInt(f.minReorderPoint, 500, 0, 1_000_000));
  }

  if (f.sellStartYear != null) {
    const y = clampInt(f.sellStartYear, 2005, 1900, 2100);
    where.parts.push(
      needsAlias
        ? "YEAR(p.SellStartDate) = ?"
        : "YEAR(SellStartDate) = ?",
    );
    where.params.push(y);
  }

  const nameContains = asStringFilter(f.nameContains);
  if (nameContains) {
    where.parts.push(needsAlias ? "LOWER(p.Name) LIKE ?" : "LOWER(Name) LIKE ?");
    where.params.push(`%${nameContains.toLowerCase()}%`);
  }

  const prefix = asStringFilter(f.productNumberPrefix);
  if (prefix) {
    where.parts.push(
      needsAlias ? "p.ProductNumber LIKE ?" : "ProductNumber LIKE ?",
    );
    where.params.push(`${prefix}%`);
  }

  const productLine = asStringFilter(f.productLine);
  if (productLine) {
    where.parts.push(needsAlias ? "p.ProductLine = ?" : "ProductLine = ?");
    where.params.push(productLine);
  }

  if (f.maxWeight != null) {
    where.parts.push(needsAlias ? "p.Weight < ?" : "Weight < ?");
    where.params.push(Number(f.maxWeight));
  }

  // Need at least one meaningful filter beyond 1=1 / ListPrice > 0
  const optionalCount = where.params.length + (f.finishedGoodsFlag != null ? 1 : 0) + (f.makeFlag != null ? 1 : 0);
  if (optionalCount === 0 && where.parts.length <= 2) return null;

  const limit = clampInt(f.limit, 25, 1, 100);
  where.params.push(limit);

  const table = needsAlias ? from + "\n" + joins : "product";
  const orderCol = needsAlias ? "p.ListPrice" : "ListPrice";
  const select = needsAlias
    ? `SELECT p.Name AS productName, p.ListPrice AS listPrice, COALESCE(p.Color, 'No color') AS color`
    : `SELECT Name AS productName, ListPrice AS listPrice, COALESCE(Color, 'No color') AS color`;

  return {
    sql: `${select}
FROM ${table}
WHERE ${where.parts.join("\n  AND ")}
ORDER BY ${orderCol} ASC
LIMIT ?`,
    params: where.params,
    columns: ["productName", "listPrice", "color"],
  };
}

export const buildProductQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  switch (plan.intent) {
    case "count_products": {
      const cat = pushCategoryJoin(f);
      if (cat) {
        return {
          sql: `SELECT COUNT(*) AS productCount
FROM product p
${cat.joins}
WHERE ${cat.where}`,
          params: cat.params,
          columns: ["productCount"],
        };
      }
      return {
        sql: "SELECT COUNT(*) AS productCount FROM product",
        params: [],
        columns: ["productCount"],
      };
    }
    case "count_products_without_subcategory":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE ProductSubcategoryID IS NULL`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_without_color":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE Color IS NULL OR Color = ''`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_with_color":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE Color IS NOT NULL AND Color <> ''`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_under_price": {
      const maxPrice = clampPrice(f.maxPrice, 20);
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE ListPrice > 0 AND ListPrice < ?`,
        params: [maxPrice],
        columns: ["productCount"],
      };
    }
    case "count_products_over_price": {
      const minPrice = clampPrice(f.minPrice, 500);
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE ListPrice > ?`,
        params: [minPrice],
        columns: ["productCount"],
      };
    }
    case "count_products_zero_price":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE ListPrice = 0 OR ListPrice IS NULL`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_make_flag":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE MakeFlag = 1`,
        params: [],
        columns: ["productCount"],
      };
    case "count_finished_goods":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE FinishedGoodsFlag = 1`,
        params: [],
        columns: ["productCount"],
      };
    case "count_sellable_products":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE SellEndDate IS NULL OR SellEndDate > NOW()`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_zero_safety_stock":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE SafetyStockLevel = 0`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_without_model":
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product
WHERE ProductModelID IS NULL`,
        params: [],
        columns: ["productCount"],
      };
    case "count_distinct_colors":
      return {
        sql: `SELECT COUNT(DISTINCT Color) AS colorCount
FROM product
WHERE Color IS NOT NULL AND Color <> ''`,
        params: [],
        columns: ["colorCount"],
      };
    case "count_categories":
      return {
        sql: `SELECT COUNT(*) AS categoryCount FROM productcategory`,
        params: [],
        columns: ["categoryCount"],
      };
    case "count_subcategories":
      return {
        sql: `SELECT COUNT(*) AS subcategoryCount FROM productsubcategory`,
        params: [],
        columns: ["subcategoryCount"],
      };
    case "list_categories":
      return {
        sql: `SELECT Name AS category FROM productcategory ORDER BY Name ASC`,
        params: [],
        columns: ["category"],
      };
    case "list_subcategories":
      return {
        sql: `SELECT Name AS subcategory FROM productsubcategory ORDER BY Name ASC`,
        params: [],
        columns: ["subcategory"],
      };
    case "list_product_lines":
      return {
        sql: `SELECT DISTINCT ProductLine AS productLine
FROM product
WHERE ProductLine IS NOT NULL AND ProductLine <> ''
ORDER BY productLine ASC`,
        params: [],
        columns: ["productLine"],
      };
    case "list_discontinued_products": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT Name AS productName, SellEndDate AS sellEndDate
FROM product
WHERE SellEndDate IS NOT NULL AND SellEndDate <= NOW()
ORDER BY SellEndDate DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "sellEndDate"],
      };
    }
    case "top_category_by_product_count":
      return {
        sql: `SELECT pc.Name AS category, COUNT(*) AS productCount
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY productCount DESC
LIMIT 1`,
        params: [],
        columns: ["category", "productCount"],
      };
    case "bottom_subcategory_by_product_count":
      return {
        sql: `SELECT ps.Name AS subcategory, COUNT(*) AS productCount
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
GROUP BY ps.Name
ORDER BY productCount ASC
LIMIT 1`,
        params: [],
        columns: ["subcategory", "productCount"],
      };
    case "top_color_by_product_count":
      return {
        sql: `SELECT COALESCE(Color, 'No color') AS color, COUNT(*) AS productCount
FROM product
GROUP BY Color
ORDER BY productCount DESC
LIMIT 1`,
        params: [],
        columns: ["color", "productCount"],
      };
    case "avg_list_price": {
      const cat = pushCategoryJoin(f);
      if (cat) {
        return {
          sql: `SELECT AVG(p.ListPrice) AS avgListPrice
FROM product p
${cat.joins}
WHERE p.ListPrice > 0 AND ${cat.where}`,
          params: cat.params,
          columns: ["avgListPrice"],
        };
      }
      return {
        sql: `SELECT AVG(ListPrice) AS avgListPrice
FROM product
WHERE ListPrice > 0`,
        params: [],
        columns: ["avgListPrice"],
      };
    }
    case "median_list_price":
      // Classic median via ordered subquery + offset (MySQL has no MEDIAN()).
      return {
        sql: `SELECT AVG(mid.ListPrice) AS medianListPrice
FROM (
  SELECT ListPrice
  FROM product
  WHERE ListPrice > 0
  ORDER BY ListPrice
  LIMIT 2 - (
    SELECT COUNT(*) FROM product WHERE ListPrice > 0
  ) % 2
  OFFSET (
    SELECT (COUNT(*) - 1) DIV 2 FROM product WHERE ListPrice > 0
  )
) AS mid`,
        params: [],
        columns: ["medianListPrice"],
      };
    case "cheapest_product":
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ListPrice > 0
ORDER BY ListPrice ASC
LIMIT 1`,
        params: [],
        columns: ["productName", "listPrice"],
      };
    case "most_expensive_product":
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ListPrice > 0
ORDER BY ListPrice DESC
LIMIT 1`,
        params: [],
        columns: ["productName", "listPrice"],
      };
    case "top_cheapest_products": {
      const limit = clampInt(f.limit, 20, 1, 100);
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ListPrice > 0
ORDER BY ListPrice ASC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "listPrice"],
      };
    }
    case "top_heavy_products": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT Name AS productName, Weight AS weight
FROM product
WHERE Weight IS NOT NULL AND Weight > 0
ORDER BY Weight DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "weight"],
      };
    }
    case "products_price_above_cost": {
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice, StandardCost AS standardCost
FROM product
WHERE ListPrice > StandardCost AND ListPrice > 0
ORDER BY (ListPrice - StandardCost) DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "listPrice", "standardCost"],
      };
    }
    case "avg_margin_by_category":
      return {
        sql: `SELECT pc.Name AS category, AVG(p.ListPrice - p.StandardCost) AS avgMargin
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0
GROUP BY pc.Name
ORDER BY avgMargin DESC`,
        params: [],
        columns: ["category", "avgMargin"],
      };
    case "products_by_category":
      return {
        sql: `SELECT pc.Name AS category, COUNT(*) AS productCount
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY productCount DESC`,
        params: [],
        columns: ["category", "productCount"],
      };
    case "avg_list_price_by_category":
      return {
        sql: `SELECT pc.Name AS category, AVG(p.ListPrice) AS avgListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0
GROUP BY pc.Name
ORDER BY avgListPrice DESC`,
        params: [],
        columns: ["category", "avgListPrice"],
      };
    case "avg_list_price_by_subcategory":
      return {
        sql: `SELECT ps.Name AS subcategory, AVG(p.ListPrice) AS avgListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
WHERE p.ListPrice > 0
GROUP BY ps.Name
ORDER BY avgListPrice DESC`,
        params: [],
        columns: ["subcategory", "avgListPrice"],
      };
    case "avg_list_price_by_color":
      return {
        sql: `SELECT COALESCE(Color, 'No color') AS color, AVG(ListPrice) AS avgListPrice
FROM product
WHERE ListPrice > 0
GROUP BY Color
ORDER BY avgListPrice DESC`,
        params: [],
        columns: ["color", "avgListPrice"],
      };
    case "avg_weight_by_category":
      return {
        sql: `SELECT pc.Name AS category, AVG(p.Weight) AS avgWeight
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.Weight IS NOT NULL AND p.Weight > 0
GROUP BY pc.Name
ORDER BY avgWeight DESC`,
        params: [],
        columns: ["category", "avgWeight"],
      };
    case "avg_days_to_manufacture_by_category":
      return {
        sql: `SELECT pc.Name AS category, AVG(p.DaysToManufacture) AS avgDays
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY avgDays DESC`,
        params: [],
        columns: ["category", "avgDays"],
      };
    case "min_list_price_by_category":
      return {
        sql: `SELECT pc.Name AS category, MIN(p.ListPrice) AS minListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0
GROUP BY pc.Name
ORDER BY minListPrice ASC`,
        params: [],
        columns: ["category", "minListPrice"],
      };
    case "max_list_price_by_category":
      return {
        sql: `SELECT pc.Name AS category, MAX(p.ListPrice) AS maxListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0
GROUP BY pc.Name
ORDER BY maxListPrice DESC`,
        params: [],
        columns: ["category", "maxListPrice"],
      };
    case "sum_list_price_by_category":
      return {
        sql: `SELECT pc.Name AS category, SUM(p.ListPrice) AS sumListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0
GROUP BY pc.Name
ORDER BY sumListPrice DESC`,
        params: [],
        columns: ["category", "sumListPrice"],
      };
    case "products_by_subcategory":
      return {
        sql: `SELECT ps.Name AS subcategory, COUNT(*) AS productCount
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
GROUP BY ps.Name
ORDER BY productCount DESC`,
        params: [],
        columns: ["subcategory", "productCount"],
      };
    case "products_by_color":
      return {
        sql: `SELECT COALESCE(Color, 'No color') AS color, COUNT(*) AS productCount
FROM product
GROUP BY Color
ORDER BY productCount DESC`,
        params: [],
        columns: ["color", "productCount"],
      };
    case "products_by_size":
      return {
        sql: `SELECT COALESCE(Size, 'No size') AS size, COUNT(*) AS productCount
FROM product
GROUP BY Size
ORDER BY productCount DESC`,
        params: [],
        columns: ["size", "productCount"],
      };
    case "products_by_class":
      return {
        sql: `SELECT COALESCE(Class, 'No class') AS class, COUNT(*) AS productCount
FROM product
GROUP BY Class
ORDER BY productCount DESC`,
        params: [],
        columns: ["class", "productCount"],
      };
    case "products_by_style":
      return {
        sql: `SELECT COALESCE(Style, 'No style') AS style, COUNT(*) AS productCount
FROM product
GROUP BY Style
ORDER BY productCount DESC`,
        params: [],
        columns: ["style", "productCount"],
      };
    case "products_by_model":
      return {
        sql: `SELECT ProductModelID AS productModelId, COUNT(*) AS productCount
FROM product
WHERE ProductModelID IS NOT NULL
GROUP BY ProductModelID
ORDER BY productCount DESC`,
        params: [],
        columns: ["productModelId", "productCount"],
      };
    case "list_products":
      return buildListProductsQuery(plan);
    case "list_products_by_weight": {
      const maxWeight = Number(f.maxWeight ?? 10);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT Name AS productName, Weight AS weight, ListPrice AS listPrice
FROM product
WHERE Weight IS NOT NULL AND Weight > 0 AND Weight < ?
ORDER BY Weight ASC
LIMIT ${limit}`,
        params: [maxWeight],
        columns: ["productName", "weight", "listPrice"],
      };
    }
    case "product_by_id": {
      const id = clampInt(f.productId, 0, 1, 2_000_000);
      if (id < 1) return null;
      return {
        sql: `SELECT ProductID AS productId, Name AS productName, ListPrice AS listPrice, COALESCE(Color, 'No color') AS color
FROM product
WHERE ProductID = ?`,
        params: [id],
        columns: ["productId", "productName", "listPrice", "color"],
      };
    }
    case "product_list_price_by_id": {
      const id = clampInt(f.productId, 0, 1, 2_000_000);
      if (id < 1) return null;
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ProductID = ?`,
        params: [id],
        columns: ["productName", "listPrice"],
      };
    }
    case "newest_products_by_sell_start": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT Name AS productName, SellStartDate AS sellStartDate, ListPrice AS listPrice
FROM product
WHERE SellStartDate IS NOT NULL
ORDER BY SellStartDate DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "sellStartDate", "listPrice"],
      };
    }
    case "subcategories_by_category": {
      const category = asStringFilter(f.category);
      if (!category) return null;
      return {
        sql: `SELECT ps.Name AS subcategory
FROM productsubcategory ps
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE pc.Name = ?
ORDER BY ps.Name ASC`,
        params: [category],
        columns: ["subcategory"],
      };
    }
    case "category_for_subcategory": {
      const subcategory = asStringFilter(f.subcategory);
      if (!subcategory) return null;
      return {
        sql: `SELECT pc.Name AS category, ps.Name AS subcategory
FROM productsubcategory ps
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE ps.Name = ?
LIMIT 1`,
        params: [subcategory],
        columns: ["category", "subcategory"],
      };
    }
    case "compare_avg_price_categories": {
      const cats = Array.isArray(f.categories)
        ? f.categories.map((c) => String(c)).filter(Boolean)
        : [];
      if (cats.length < 2) return null;
      return {
        sql: `SELECT pc.Name AS category, AVG(p.ListPrice) AS avgListPrice
FROM product p
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE p.ListPrice > 0 AND pc.Name IN (?, ?)
GROUP BY pc.Name
ORDER BY avgListPrice DESC`,
        params: [cats[0], cats[1]],
        columns: ["category", "avgListPrice"],
      };
    }
    case "sample_products": {
      const limit = clampInt(f.limit, 15, 1, 100);
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice, COALESCE(Color, 'No color') AS color
FROM product
WHERE ListPrice > 0
ORDER BY RAND()
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "listPrice", "color"],
      };
    }
    case "top_expensive_products": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const cat = pushCategoryJoin(f);
      if (cat) {
        return {
          sql: `SELECT p.Name AS productName, p.ListPrice AS listPrice
FROM product p
${cat.joins}
WHERE p.ListPrice > 0 AND ${cat.where}
ORDER BY p.ListPrice DESC
LIMIT ${limit}`,
          params: cat.params,
          columns: ["productName", "listPrice"],
        };
      }
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ListPrice > 0
ORDER BY ListPrice DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "listPrice"],
      };
    }
    case "cheapest_products_under_price": {
      const maxPrice = clampPrice(f.maxPrice, 50);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT Name AS productName, ListPrice AS listPrice
FROM product
WHERE ListPrice > 0 AND ListPrice < ${maxPrice}
ORDER BY ListPrice ASC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "listPrice"],
      };
    }
    default:
      return null;
  }
}
