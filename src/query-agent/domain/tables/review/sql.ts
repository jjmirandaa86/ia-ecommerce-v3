/**
 * sql.ts — Review SELECT templates (productreview + product joins).
 */
import type { BuiltQuery, QueryPlan } from "@/query-agent/domain/intent-module";
import { clampInt } from "@/query-agent/domain/tables/review/extract";

const buildListReviewsQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  const parts = ["1=1"];
  const params: unknown[] = [];
  let joins = "";
  let from = "productreview r";

  const needsProduct =
    f.color != null ||
    f.category != null ||
    f.maxPrice != null ||
    f.minPrice != null;

  if (needsProduct) {
    joins += `\nINNER JOIN product p ON p.ProductID = r.ProductID`;
  }
  if (f.category != null) {
    joins += `
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`;
    parts.push("pc.Name = ?");
    params.push(String(f.category));
  }
  if (f.color != null) {
    parts.push("p.Color = ?");
    params.push(String(f.color));
  }
  if (f.rating != null) {
    parts.push("r.Rating = ?");
    params.push(clampInt(f.rating, 5, 1, 5));
  }
  if (f.minRating != null) {
    parts.push("r.Rating >= ?");
    params.push(clampInt(f.minRating, 1, 1, 5));
  }
  if (f.maxRating != null) {
    parts.push("r.Rating <= ?");
    params.push(clampInt(f.maxRating, 5, 1, 5));
  }
  if (f.productId != null) {
    parts.push("r.ProductID = ?");
    params.push(clampInt(f.productId, 0, 1, 2_000_000));
  }
  if (f.reviewerName != null) {
    parts.push("r.ReviewerName = ?");
    params.push(String(f.reviewerName));
  }
  if (f.commentContains != null) {
    parts.push("LOWER(r.Comments) LIKE ?");
    params.push(`%${String(f.commentContains).toLowerCase()}%`);
  }
  if (f.hasComments === true) {
    parts.push("r.Comments IS NOT NULL AND TRIM(r.Comments) <> ''");
  }
  if (f.hasComments === false) {
    parts.push("(r.Comments IS NULL OR TRIM(r.Comments) = '')");
  }
  if (f.lastMonths != null) {
    parts.push("r.ReviewDate >= DATE_SUB(NOW(), INTERVAL ? MONTH)");
    params.push(clampInt(f.lastMonths, 12, 1, 120));
  }

  if (params.length === 0 && parts.length === 1 && f.hasComments == null) {
    // allow bare list with sort/limit only
  }

  const limit = clampInt(f.limit, 25, 1, 100);
  const order =
    f.sort === "latest" || f.sort === "oldest"
      ? f.sort === "oldest"
        ? "r.ReviewDate ASC"
        : "r.ReviewDate DESC"
      : "r.ReviewDate DESC";

  params.push(limit);

  return {
    sql: `SELECT r.ProductReviewID AS productReviewId, r.ProductID AS productId,
  r.ReviewerName AS reviewerName, r.Rating AS rating, r.ReviewDate AS reviewDate,
  LEFT(COALESCE(r.Comments, ''), 120) AS commentPreview
FROM ${from}${joins}
WHERE ${parts.join("\n  AND ")}
ORDER BY ${order}
LIMIT ?`,
    params,
    columns: [
      "productReviewId",
      "productId",
      "reviewerName",
      "rating",
      "reviewDate",
      "commentPreview",
    ],
  };
}

export const buildReviewQuery = (plan: QueryPlan): BuiltQuery | null => {
  const f = plan.filters;
  switch (plan.intent) {
    case "count_products_with_reviews":
      return {
        sql: `SELECT COUNT(DISTINCT ProductID) AS productCount FROM productreview`,
        params: [],
        columns: ["productCount"],
      };
    case "count_products_without_reviews": {
      const parts = [
        "NOT EXISTS (SELECT 1 FROM productreview r WHERE r.ProductID = p.ProductID)",
      ];
      const params: unknown[] = [];
      if (f.finishedGoodsFlag === true) {
        parts.unshift("p.FinishedGoodsFlag = 1");
      }
      return {
        sql: `SELECT COUNT(*) AS productCount
FROM product p
WHERE ${parts.join(" AND ")}`,
        params,
        columns: ["productCount"],
      };
    }
    case "count_reviews":
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview`,
        params: [],
        columns: ["reviewCount"],
      };
    case "count_reviews_with_comments":
      return {
        sql: `SELECT COUNT(*) AS reviewCount
FROM productreview
WHERE Comments IS NOT NULL AND TRIM(Comments) <> ''`,
        params: [],
        columns: ["reviewCount"],
      };
    case "count_reviews_without_comments":
      return {
        sql: `SELECT COUNT(*) AS reviewCount
FROM productreview
WHERE Comments IS NULL OR TRIM(Comments) = ''`,
        params: [],
        columns: ["reviewCount"],
      };
    case "count_distinct_reviewers":
      return {
        sql: `SELECT COUNT(DISTINCT ReviewerName) AS reviewerCount
FROM productreview
WHERE ReviewerName IS NOT NULL AND ReviewerName <> ''`,
        params: [],
        columns: ["reviewerCount"],
      };
    case "count_reviews_by_rating": {
      const rating = clampInt(f.rating, 5, 1, 5);
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE Rating = ?`,
        params: [rating],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_min_rating": {
      const minRating = clampInt(f.minRating, 3, 1, 5);
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE Rating >= ?`,
        params: [minRating],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_max_rating": {
      const maxRating = clampInt(f.maxRating, 2, 1, 5);
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE Rating <= ?`,
        params: [maxRating],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_for_product": {
      const id = clampInt(f.productId, 0, 1, 2_000_000);
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE ProductID = ?`,
        params: [id],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_by_reviewer": {
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE ReviewerName = ?`,
        params: [String(f.reviewerName ?? "")],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_by_year": {
      const year = clampInt(f.year, 2007, 1900, 2100);
      return {
        sql: `SELECT COUNT(*) AS reviewCount FROM productreview WHERE YEAR(ReviewDate) = ?`,
        params: [year],
        columns: ["reviewCount"],
      };
    }
    case "count_reviews_for_category": {
      return {
        sql: `SELECT COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE pc.Name = ?`,
        params: [String(f.category ?? "")],
        columns: ["reviewCount"],
      };
    }
    case "average_product_rating": {
      if (f.maxPrice != null) {
        return {
          sql: `SELECT AVG(r.Rating) AS avgRating
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
WHERE p.ListPrice > 0 AND p.ListPrice < ?`,
          params: [Number(f.maxPrice)],
          columns: ["avgRating"],
        };
      }
      return {
        sql: `SELECT AVG(Rating) AS avgRating FROM productreview`,
        params: [],
        columns: ["avgRating"],
      };
    }
    case "average_rating_for_product": {
      const id = clampInt(f.productId, 0, 1, 2_000_000);
      return {
        sql: `SELECT AVG(Rating) AS avgRating FROM productreview WHERE ProductID = ?`,
        params: [id],
        columns: ["avgRating"],
      };
    }
    case "min_product_rating":
      return {
        sql: `SELECT MIN(Rating) AS minRating FROM productreview`,
        params: [],
        columns: ["minRating"],
      };
    case "max_product_rating":
      return {
        sql: `SELECT MAX(Rating) AS maxRating FROM productreview`,
        params: [],
        columns: ["maxRating"],
      };
    case "median_product_rating":
      return {
        sql: `SELECT AVG(mid.Rating) AS medianRating
FROM (
  SELECT Rating FROM productreview
  ORDER BY Rating
  LIMIT 2 - (SELECT COUNT(*) FROM productreview) % 2
  OFFSET (SELECT (COUNT(*) - 1) DIV 2 FROM productreview)
) AS mid`,
        params: [],
        columns: ["medianRating"],
      };
    case "sum_review_ratings":
      return {
        sql: `SELECT SUM(Rating) AS sumRating FROM productreview`,
        params: [],
        columns: ["sumRating"],
      };
    case "avg_reviews_per_product":
      return {
        sql: `SELECT AVG(cnt) AS avgReviews
FROM (
  SELECT COUNT(*) AS cnt FROM productreview GROUP BY ProductID
) t`,
        params: [],
        columns: ["avgReviews"],
      };
    case "pct_reviews_by_rating": {
      const rating = clampInt(f.rating, 5, 1, 5);
      return {
        sql: `SELECT
  (SELECT COUNT(*) FROM productreview WHERE Rating = ?) * 100.0 /
  NULLIF((SELECT COUNT(*) FROM productreview), 0) AS pctRating`,
        params: [rating],
        columns: ["pctRating"],
      };
    }
    case "variance_product_rating":
      return {
        sql: `SELECT VARIANCE(Rating) AS varianceRating FROM productreview`,
        params: [],
        columns: ["varianceRating"],
      };
    case "reviews_by_rating":
      return {
        sql: `SELECT Rating AS rating, COUNT(*) AS reviewCount
FROM productreview
GROUP BY Rating
ORDER BY Rating ASC`,
        params: [],
        columns: ["rating", "reviewCount"],
      };
    case "avg_rating_by_product":
      return {
        sql: `SELECT p.Name AS productName, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.ProductID, p.Name
ORDER BY avgRating DESC`,
        params: [],
        columns: ["productName", "avgRating", "reviewCount"],
      };
    case "review_count_by_product":
      return {
        sql: `SELECT p.Name AS productName, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.ProductID, p.Name
ORDER BY reviewCount DESC`,
        params: [],
        columns: ["productName", "reviewCount"],
      };
    case "products_highest_avg_rating":
    case "products_lowest_avg_rating": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const minRc = clampInt(f.minReviewCount, 1, 1, 1000);
      const desc = plan.intent === "products_highest_avg_rating";
      let joins = `INNER JOIN product p ON p.ProductID = r.ProductID`;
      const parts = ["1=1"];
      const params: unknown[] = [];
      if (f.category != null) {
        joins += `
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID`;
        parts.push("pc.Name = ?");
        params.push(String(f.category));
      }
      params.push(minRc, limit);
      return {
        sql: `SELECT p.Name AS productName, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
${joins}
WHERE ${parts.join(" AND ")}
GROUP BY p.ProductID, p.Name
HAVING COUNT(*) >= ?
ORDER BY avgRating ${desc ? "DESC" : "ASC"}
LIMIT ?`,
        params,
        columns: ["productName", "avgRating", "reviewCount"],
      };
    }
    case "products_most_reviews":
    case "products_fewest_reviews": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const desc = plan.intent === "products_most_reviews";
      return {
        sql: `SELECT p.Name AS productName, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.ProductID, p.Name
ORDER BY reviewCount ${desc ? "DESC" : "ASC"}
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "reviewCount"],
      };
    }
    case "products_with_avg_rating": {
      const avgRating = clampInt(f.avgRating, 5, 1, 5);
      const minRc = clampInt(f.minReviewCount, 1, 1, 1000);
      return {
        sql: `SELECT p.Name AS productName, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.ProductID, p.Name
HAVING AVG(r.Rating) = ? AND COUNT(*) >= ?
ORDER BY reviewCount DESC`,
        params: [avgRating, minRc],
        columns: ["productName", "avgRating", "reviewCount"],
      };
    }
    case "products_only_rating": {
      const rating = clampInt(f.rating, 1, 1, 5);
      return {
        sql: `SELECT p.Name AS productName, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.ProductID, p.Name
HAVING MIN(r.Rating) = ? AND MAX(r.Rating) = ?`,
        params: [rating, rating],
        columns: ["productName", "reviewCount"],
      };
    }
    case "worst_review":
      return {
        sql: `SELECT r.ProductReviewID AS productReviewId, p.Name AS productName,
  r.ReviewerName AS reviewerName, r.Rating AS rating,
  LEFT(COALESCE(r.Comments, ''), 200) AS commentPreview
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
ORDER BY r.Rating ASC, r.ReviewDate ASC
LIMIT 1`,
        params: [],
        columns: ["productReviewId", "productName", "reviewerName", "rating", "commentPreview"],
      };
    case "best_review":
      return {
        sql: `SELECT r.ProductReviewID AS productReviewId, p.Name AS productName,
  r.ReviewerName AS reviewerName, r.Rating AS rating,
  LEFT(COALESCE(r.Comments, ''), 200) AS commentPreview
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
ORDER BY r.Rating DESC, r.ReviewDate DESC
LIMIT 1`,
        params: [],
        columns: ["productReviewId", "productName", "reviewerName", "rating", "commentPreview"],
      };
    case "latest_reviews":
    case "oldest_reviews": {
      const limit = clampInt(f.limit, 10, 1, 100);
      const asc = plan.intent === "oldest_reviews";
      return {
        sql: `SELECT r.ProductReviewID AS productReviewId, p.Name AS productName,
  r.ReviewerName AS reviewerName, r.Rating AS rating, r.ReviewDate AS reviewDate
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
ORDER BY r.ReviewDate ${asc ? "ASC" : "DESC"}
LIMIT ${limit}`,
        params: [],
        columns: ["productReviewId", "productName", "reviewerName", "rating", "reviewDate"],
      };
    }
    case "latest_review_date":
      return {
        sql: `SELECT MAX(ReviewDate) AS latestReviewDate FROM productreview`,
        params: [],
        columns: ["latestReviewDate"],
      };
    case "list_reviews":
      return buildListReviewsQuery(plan);
    case "list_reviewers":
      return {
        sql: `SELECT DISTINCT ReviewerName AS reviewerName
FROM productreview
WHERE ReviewerName IS NOT NULL AND ReviewerName <> ''
ORDER BY reviewerName ASC`,
        params: [],
        columns: ["reviewerName"],
      };
    case "list_reviewed_products": {
      const minPrice = Number(f.minPrice ?? 0);
      const limit = clampInt(f.limit, 25, 1, 100);
      return {
        sql: `SELECT DISTINCT p.Name AS productName, p.ListPrice AS listPrice
FROM product p
INNER JOIN productreview r ON r.ProductID = p.ProductID
WHERE p.ListPrice > ?
ORDER BY p.ListPrice DESC
LIMIT ${limit}`,
        params: [minPrice],
        columns: ["productName", "listPrice"],
      };
    }
    case "review_by_id": {
      const id = clampInt(f.productReviewId, 0, 1, 2_000_000);
      return {
        sql: `SELECT r.ProductReviewID AS productReviewId, p.Name AS productName,
  r.ReviewerName AS reviewerName, r.Rating AS rating, r.ReviewDate AS reviewDate,
  LEFT(COALESCE(r.Comments, ''), 200) AS commentPreview
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
WHERE r.ProductReviewID = ?`,
        params: [id],
        columns: ["productReviewId", "productName", "reviewerName", "rating", "reviewDate", "commentPreview"],
      };
    }
    case "sample_reviews": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT r.ProductReviewID AS productReviewId, p.Name AS productName,
  r.Rating AS rating, r.ReviewerName AS reviewerName
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
ORDER BY RAND()
LIMIT ${limit}`,
        params: [],
        columns: ["productReviewId", "productName", "rating", "reviewerName"],
      };
    }
    case "longest_review_comments": {
      const limit = clampInt(f.limit, 10, 1, 100);
      return {
        sql: `SELECT p.Name AS productName, r.ReviewerName AS reviewerName, r.Rating AS rating,
  CHAR_LENGTH(r.Comments) AS commentLength,
  LEFT(r.Comments, 160) AS commentPreview
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
WHERE r.Comments IS NOT NULL AND TRIM(r.Comments) <> ''
ORDER BY CHAR_LENGTH(r.Comments) DESC
LIMIT ${limit}`,
        params: [],
        columns: ["productName", "reviewerName", "rating", "commentLength", "commentPreview"],
      };
    }
    case "top_reviewer_by_count":
      return {
        sql: `SELECT ReviewerName AS reviewerName, COUNT(*) AS reviewCount
FROM productreview
WHERE ReviewerName IS NOT NULL AND ReviewerName <> ''
GROUP BY ReviewerName
ORDER BY reviewCount DESC
LIMIT 1`,
        params: [],
        columns: ["reviewerName", "reviewCount"],
      };
    case "avg_rating_by_reviewer":
      return {
        sql: `SELECT ReviewerName AS reviewerName, AVG(Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview
WHERE ReviewerName IS NOT NULL AND ReviewerName <> ''
GROUP BY ReviewerName
ORDER BY avgRating DESC`,
        params: [],
        columns: ["reviewerName", "avgRating", "reviewCount"],
      };
    case "avg_rating_by_year":
      return {
        sql: `SELECT YEAR(ReviewDate) AS reviewYear, AVG(Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview
GROUP BY YEAR(ReviewDate)
ORDER BY reviewYear ASC`,
        params: [],
        columns: ["reviewYear", "avgRating", "reviewCount"],
      };
    case "review_count_by_month":
      return {
        sql: `SELECT DATE_FORMAT(ReviewDate, '%Y-%m') AS reviewMonth, COUNT(*) AS reviewCount
FROM productreview
GROUP BY DATE_FORMAT(ReviewDate, '%Y-%m')
ORDER BY reviewMonth ASC`,
        params: [],
        columns: ["reviewMonth", "reviewCount"],
      };
    case "avg_rating_by_category":
      return {
        sql: `SELECT pc.Name AS category, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY avgRating DESC`,
        params: [],
        columns: ["category", "avgRating", "reviewCount"],
      };
    case "avg_rating_by_subcategory":
      return {
        sql: `SELECT ps.Name AS subcategory, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
GROUP BY ps.Name
ORDER BY avgRating DESC`,
        params: [],
        columns: ["subcategory", "avgRating", "reviewCount"],
      };
    case "avg_rating_by_color":
      return {
        sql: `SELECT COALESCE(p.Color, 'No color') AS color, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
GROUP BY p.Color
ORDER BY avgRating DESC`,
        params: [],
        columns: ["color", "avgRating", "reviewCount"],
      };
    case "review_count_by_category":
      return {
        sql: `SELECT pc.Name AS category, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY reviewCount DESC`,
        params: [],
        columns: ["category", "reviewCount"],
      };
    case "review_count_by_model":
      return {
        sql: `SELECT p.ProductModelID AS productModelId, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
WHERE p.ProductModelID IS NOT NULL
GROUP BY p.ProductModelID
ORDER BY reviewCount DESC`,
        params: [],
        columns: ["productModelId", "reviewCount"],
      };
    case "top_category_by_avg_rating":
      return {
        sql: `SELECT pc.Name AS category, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
GROUP BY pc.Name
ORDER BY avgRating DESC
LIMIT 1`,
        params: [],
        columns: ["category", "avgRating", "reviewCount"],
      };
    case "compare_avg_rating_categories": {
      const cats = Array.isArray(f.categories)
        ? f.categories.map(String).filter(Boolean)
        : [];
      if (cats.length < 2) return null;
      return {
        sql: `SELECT pc.Name AS category, AVG(r.Rating) AS avgRating, COUNT(*) AS reviewCount
FROM productreview r
INNER JOIN product p ON p.ProductID = r.ProductID
INNER JOIN productsubcategory ps ON ps.ProductSubcategoryID = p.ProductSubcategoryID
INNER JOIN productcategory pc ON pc.ProductCategoryID = ps.ProductCategoryID
WHERE pc.Name IN (?, ?)
GROUP BY pc.Name
ORDER BY avgRating DESC`,
        params: [cats[0], cats[1]],
        columns: ["category", "avgRating", "reviewCount"],
      };
    }
    default:
      return null;
  }
}
