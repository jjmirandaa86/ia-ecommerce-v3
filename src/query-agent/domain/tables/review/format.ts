/**
 * format.ts — Review natural-language answers.
 * Turns executed query rows into English chat replies.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";

const asNumber = (raw: unknown): number | null => {
  if (raw == null) return null;
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

const asText = (raw: unknown, fallback = "Unknown"): string => {
  if (raw == null) return fallback;
  const s = String(raw).trim();
  return s || fallback;
}

const fmtRating = (n: number): string => {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const bulletLines = (
  rows: Record<string, unknown>[],
  map: (r: Record<string, unknown>) => string,
): string => {
  return rows.map((r) => `• ${map(r)}`).join("\n");
}

export const formatReviewAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null => {
  const f = plan.filters;

  switch (plan.intent) {
    case "count_products_with_reviews": {
      const count = asNumber(rows[0]?.productCount ?? rows[0]?.productcount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} product${count === 1 ? "" : "s"} with reviews.`;
    }
    case "count_products_without_reviews": {
      const count = asNumber(rows[0]?.productCount ?? rows[0]?.productcount) ?? 0;
      const scope = f.finishedGoodsFlag === true ? " finished goods" : "";
      return `There ${count === 1 ? "is" : "are"} ${count}${scope} product${count === 1 ? "" : "s"} without reviews.`;
    }
    case "count_reviews": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} review${count === 1 ? "" : "s"} in total.`;
    }
    case "count_reviews_with_comments": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} include comments.`;
    }
    case "count_reviews_without_comments": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} have no comments.`;
    }
    case "count_distinct_reviewers": {
      const count = asNumber(rows[0]?.reviewerCount ?? rows[0]?.reviewercount) ?? 0;
      return `There ${count === 1 ? "is" : "are"} ${count} distinct reviewer${count === 1 ? "" : "s"}.`;
    }
    case "count_reviews_by_rating": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const rating = asNumber(f.rating) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} have a ${rating}-star rating.`;
    }
    case "count_reviews_min_rating": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const min = asNumber(f.minRating) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} are rated ${min} or higher.`;
    }
    case "count_reviews_max_rating": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const max = asNumber(f.maxRating) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} are rated ${max} or lower.`;
    }
    case "count_reviews_for_product": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const id = asNumber(f.productId) ?? 0;
      return `Product ${id} has ${count} review${count === 1 ? "" : "s"}.`;
    }
    case "count_reviews_by_reviewer": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const name = asText(f.reviewerName, "that reviewer");
      return `${name} wrote ${count} review${count === 1 ? "" : "s"}.`;
    }
    case "count_reviews_by_year": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const year = asNumber(f.year) ?? 0;
      return `${count} review${count === 1 ? "" : "s"} were written in ${year}.`;
    }
    case "count_reviews_for_category": {
      const count = asNumber(rows[0]?.reviewCount ?? rows[0]?.reviewcount) ?? 0;
      const cat = asText(f.category, "that category");
      return `There ${count === 1 ? "is" : "are"} ${count} review${count === 1 ? "" : "s"} for products in ${cat}.`;
    }
    case "average_product_rating": {
      const n = asNumber(rows[0]?.avgRating ?? rows[0]?.avgrating);
      if (n == null) return "No product ratings were found.";
      if (f.maxPrice != null) {
        return `The average rating for products under $${Number(f.maxPrice)} is ${fmtRating(n)}.`;
      }
      return `The average product rating is ${fmtRating(n)}.`;
    }
    case "average_rating_for_product": {
      const n = asNumber(rows[0]?.avgRating ?? rows[0]?.avgrating);
      const id = asNumber(f.productId) ?? 0;
      if (n == null) return `No ratings were found for product ${id}.`;
      return `The average rating for product ${id} is ${fmtRating(n)}.`;
    }
    case "min_product_rating": {
      const n = asNumber(rows[0]?.minRating ?? rows[0]?.minrating);
      if (n == null) return "No product ratings were found.";
      return `The minimum product rating is ${fmtRating(n)}.`;
    }
    case "max_product_rating": {
      const n = asNumber(rows[0]?.maxRating ?? rows[0]?.maxrating);
      if (n == null) return "No product ratings were found.";
      return `The maximum product rating is ${fmtRating(n)}.`;
    }
    case "median_product_rating": {
      const n = asNumber(rows[0]?.medianRating ?? rows[0]?.medianrating);
      if (n == null) return "No product ratings were found.";
      return `The median product rating is ${fmtRating(n)}.`;
    }
    case "sum_review_ratings": {
      const n = asNumber(rows[0]?.sumRating ?? rows[0]?.sumrating) ?? 0;
      return `The sum of all review ratings is ${n}.`;
    }
    case "avg_reviews_per_product": {
      const n = asNumber(rows[0]?.avgReviews ?? rows[0]?.avgreviews);
      if (n == null) return "No review counts were found.";
      return `On average there are ${fmtRating(n)} reviews per product.`;
    }
    case "pct_reviews_by_rating": {
      const n = asNumber(rows[0]?.pctRating ?? rows[0]?.pctrating);
      const rating = asNumber(f.rating) ?? 0;
      if (n == null) return "No reviews were found.";
      return `${fmtRating(n)}% of reviews are ${rating} stars.`;
    }
    case "variance_product_rating": {
      const n = asNumber(rows[0]?.varianceRating ?? rows[0]?.variancerating);
      if (n == null) return "No product ratings were found.";
      return `The variance of product ratings is ${fmtRating(n)}.`;
    }
    case "reviews_by_rating": {
      if (!rows.length) return "No rating distribution was found.";
      return `Reviews by rating:\n${bulletLines(rows, (r) => {
        const rating = asNumber(r.rating ?? r.Rating) ?? 0;
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${rating}★: ${count}`;
      })}`;
    }
    case "avg_rating_by_product": {
      if (!rows.length) return "No average ratings by product were found.";
      return `Average rating by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "review_count_by_product": {
      if (!rows.length) return "No review counts by product were found.";
      return `Review count by product:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${count}`;
      })}`;
    }
    case "products_highest_avg_rating":
    case "products_lowest_avg_rating": {
      if (!rows.length) return "No products matched that rating ranking.";
      const label =
        plan.intent === "products_highest_avg_rating"
          ? "Highest average ratings"
          : "Lowest average ratings";
      return `${label}:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "products_most_reviews":
    case "products_fewest_reviews": {
      if (!rows.length) return "No products matched that review-count ranking.";
      const label =
        plan.intent === "products_most_reviews"
          ? "Products with the most reviews"
          : "Products with the fewest reviews";
      return `${label}:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${count}`;
      })}`;
    }
    case "products_with_avg_rating": {
      if (!rows.length) return "No products matched that average rating.";
      const target = asNumber(f.avgRating) ?? 5;
      return `Products with average rating ${target}:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "products_only_rating": {
      if (!rows.length) return "No products matched that rating-only filter.";
      const rating = asNumber(f.rating) ?? 1;
      return `Products that only have ${rating}-star reviews:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${count} review${count === 1 ? "" : "s"}`;
      })}`;
    }
    case "worst_review":
    case "best_review": {
      const row = rows[0];
      if (!row) return "No review was found.";
      const product = asText(row.productName ?? row.productname);
      const reviewer = asText(row.reviewerName ?? row.reviewername, "Anonymous");
      const rating = asNumber(row.rating ?? row.Rating) ?? 0;
      const comment = asText(row.commentPreview ?? row.commentpreview, "");
      const kind = plan.intent === "worst_review" ? "worst" : "best";
      const commentBit = comment ? ` Comment: ${comment}` : "";
      return `The ${kind} review is ${rating}★ for ${product} by ${reviewer}.${commentBit}`;
    }
    case "latest_reviews":
    case "oldest_reviews": {
      if (!rows.length) return "No reviews were found.";
      const label = plan.intent === "latest_reviews" ? "Latest reviews" : "Oldest reviews";
      return `${label}:\n${bulletLines(rows, (r) => {
        const product = asText(r.productName ?? r.productname);
        const reviewer = asText(r.reviewerName ?? r.reviewername, "Anonymous");
        const rating = asNumber(r.rating ?? r.Rating) ?? 0;
        const date = asText(r.reviewDate ?? r.reviewdate, "");
        return `${product} — ${rating}★ by ${reviewer}${date ? ` (${date})` : ""}`;
      })}`;
    }
    case "latest_review_date": {
      const date = rows[0]?.latestReviewDate ?? rows[0]?.latestreviewdate;
      if (date == null) return "No review dates were found.";
      return `The most recent review was posted on ${String(date)}.`;
    }
    case "list_reviews": {
      if (!rows.length) return "No reviews matched those filters.";
      return `Reviews:\n${bulletLines(rows, (r) => {
        const id = asNumber(r.productReviewId ?? r.productreviewid);
        const productId = asNumber(r.productId ?? r.productid);
        const reviewer = asText(r.reviewerName ?? r.reviewername, "Anonymous");
        const rating = asNumber(r.rating ?? r.Rating) ?? 0;
        const preview = asText(r.commentPreview ?? r.commentpreview, "");
        const previewBit = preview ? ` — ${preview}` : "";
        return `#${id ?? "?"} product ${productId ?? "?"} — ${rating}★ by ${reviewer}${previewBit}`;
      })}`;
    }
    case "list_reviewers": {
      if (!rows.length) return "No reviewers were found.";
      return `Reviewers:\n${bulletLines(rows, (r) => asText(r.reviewerName ?? r.reviewername))}`;
    }
    case "list_reviewed_products": {
      if (!rows.length) return "No reviewed products matched that filter.";
      return `Reviewed products:\n${bulletLines(rows, (r) => {
        const name = asText(r.productName ?? r.productname);
        const price = asNumber(r.listPrice ?? r.listprice);
        return `${name}${price == null ? "" : ` — $${price.toFixed(2)}`}`;
      })}`;
    }
    case "review_by_id": {
      const row = rows[0];
      if (!row) return "That review was not found.";
      const id = asNumber(row.productReviewId ?? row.productreviewid) ?? 0;
      const product = asText(row.productName ?? row.productname);
      const reviewer = asText(row.reviewerName ?? row.reviewername, "Anonymous");
      const rating = asNumber(row.rating ?? row.Rating) ?? 0;
      const date = asText(row.reviewDate ?? row.reviewdate, "");
      const comment = asText(row.commentPreview ?? row.commentpreview, "");
      const commentBit = comment ? ` Comment: ${comment}` : "";
      return `Review #${id}: ${product} — ${rating}★ by ${reviewer}${date ? ` on ${date}` : ""}.${commentBit}`;
    }
    case "sample_reviews": {
      if (!rows.length) return "No sample reviews were found.";
      return `Sample reviews:\n${bulletLines(rows, (r) => {
        const product = asText(r.productName ?? r.productname);
        const rating = asNumber(r.rating ?? r.Rating) ?? 0;
        const reviewer = asText(r.reviewerName ?? r.reviewername, "Anonymous");
        return `${product} — ${rating}★ by ${reviewer}`;
      })}`;
    }
    case "longest_review_comments": {
      if (!rows.length) return "No review comments were found.";
      return `Longest review comments:\n${bulletLines(rows, (r) => {
        const product = asText(r.productName ?? r.productname);
        const len = asNumber(r.commentLength ?? r.commentlength) ?? 0;
        const preview = asText(r.commentPreview ?? r.commentpreview, "");
        return `${product} (${len} chars): ${preview}`;
      })}`;
    }
    case "top_reviewer_by_count": {
      const row = rows[0];
      if (!row) return "No reviewers were found.";
      const name = asText(row.reviewerName ?? row.reviewername);
      const count = asNumber(row.reviewCount ?? row.reviewcount) ?? 0;
      return `${name} wrote the most reviews (${count}).`;
    }
    case "avg_rating_by_reviewer": {
      if (!rows.length) return "No average ratings by reviewer were found.";
      return `Average rating by reviewer:\n${bulletLines(rows, (r) => {
        const name = asText(r.reviewerName ?? r.reviewername);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "avg_rating_by_year": {
      if (!rows.length) return "No average ratings by year were found.";
      return `Average rating by year:\n${bulletLines(rows, (r) => {
        const year = asText(r.reviewYear ?? r.reviewyear);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${year}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "review_count_by_month": {
      if (!rows.length) return "No review counts by month were found.";
      return `Review count by month:\n${bulletLines(rows, (r) => {
        const month = asText(r.reviewMonth ?? r.reviewmonth);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${month}: ${count}`;
      })}`;
    }
    case "avg_rating_by_category": {
      if (!rows.length) return "No average ratings by category were found.";
      return `Average rating by category:\n${bulletLines(rows, (r) => {
        const cat = asText(r.category ?? r.Name);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${cat}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "avg_rating_by_subcategory": {
      if (!rows.length) return "No average ratings by subcategory were found.";
      return `Average rating by subcategory:\n${bulletLines(rows, (r) => {
        const name = asText(r.subcategory ?? r.Name);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${name}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "avg_rating_by_color": {
      if (!rows.length) return "No average ratings by color were found.";
      return `Average rating by color:\n${bulletLines(rows, (r) => {
        const color = asText(r.color ?? r.Color);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${color}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    case "review_count_by_category": {
      if (!rows.length) return "No review counts by category were found.";
      return `Review count by category:\n${bulletLines(rows, (r) => {
        const cat = asText(r.category ?? r.Name);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${cat}: ${count}`;
      })}`;
    }
    case "review_count_by_model": {
      if (!rows.length) return "No review counts by model were found.";
      return `Review count by product model:\n${bulletLines(rows, (r) => {
        const model = asText(r.productModelId ?? r.productmodelid);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `Model ${model}: ${count}`;
      })}`;
    }
    case "top_category_by_avg_rating": {
      const row = rows[0];
      if (!row) return "No category ratings were found.";
      const cat = asText(row.category ?? row.Name);
      const avg = asNumber(row.avgRating ?? row.avgrating);
      return `${cat} has the best average rating${avg == null ? "" : ` (${fmtRating(avg)})`}.`;
    }
    case "compare_avg_rating_categories": {
      if (!rows.length) return "No category comparison data was found.";
      return `Average rating comparison:\n${bulletLines(rows, (r) => {
        const cat = asText(r.category ?? r.Name);
        const avg = asNumber(r.avgRating ?? r.avgrating);
        const count = asNumber(r.reviewCount ?? r.reviewcount) ?? 0;
        return `${cat}: ${avg == null ? "n/a" : fmtRating(avg)} (${count} reviews)`;
      })}`;
    }
    default:
      return null;
  }
}
