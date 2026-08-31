/**
 * heuristic.ts — Review phrase detection (fast path).
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";
import {
  extractCategories,
  extractCategory,
  extractColor,
  extractCommentContains,
  extractLastMonths,
  extractMaxPrice,
  extractMaxRating,
  extractMinPrice,
  extractMinRating,
  extractMinReviewCount,
  extractProductId,
  extractRating,
  extractReviewId,
  extractReviewerName,
  extractTopN,
  extractYear,
} from "@/query-agent/domain/tables/review/extract";

export const classifyReviewHeuristic = (q: string): QueryPlan | null => {
  const aboutProducts = /\b(products?|productos?)\b/.test(q);
  const aboutReviews =
    /\b(reviews?|reseñas?|calificaciones?|reviewed)\b/.test(q) ||
    /\bhave\s+reviews?\b/.test(q);
  const aboutRating = /\b(ratings?|stars?|calificaciones?)\b/.test(q);

  const asksCount =
    /\b(how many|count|number of|total)\b/.test(q) ||
    /\b(cu[aá]ntos?|cuantas|cantidad|total de)\b/.test(q);

  const asksAvg =
    /\b(average|avg|mean|promedio)\b/.test(q) &&
    !/\b(highest|lowest|top|bottom|worst|best|ranked|m[aá]s\s+alt|m[aá]s\s+baj)\b/.test(
      q,
    ) &&
    !/\bproducts?\s+with\s+(perfect\s+)?average\s+rating\b/.test(q) &&
    !/\blist\s+products?\s+with\s+average\s+rating\b/.test(q);

  // —— Compare categories ——
  if (/\bcompare\b/.test(q) && asksAvg && aboutRating) {
    const cats = extractCategories(q);
    if (cats.length >= 2) {
      return {
        intent: "compare_avg_rating_categories",
        filters: { categories: cats.slice(0, 2) },
      };
    }
  }

  // —— Products without reviews ——
  if (
    aboutProducts &&
    (/\b(no|without|missing|unreviewed)\s+reviews?\b/.test(q) ||
      /\bhave\s+no\s+reviews?\b/.test(q) ||
      /\bunreviewed\b/.test(q))
  ) {
    const filters: Record<string, unknown> = {};
    if (/\bfinished\s+goods\b/.test(q)) filters.finishedGoodsFlag = true;
    return { intent: "count_products_without_reviews", filters };
  }

  // —— Comments counts ——
  if (
    asksCount &&
    aboutReviews &&
    (/\bwith\s+comments?\b/.test(q) || /\bhave\s+comments?\b/.test(q))
  ) {
    return { intent: "count_reviews_with_comments", filters: {} };
  }
  if (
    asksCount &&
    aboutReviews &&
    (/\b(no|without|empty)\s+comments?\b/.test(q) || /\bhave\s+no\s+comments?\b/.test(q))
  ) {
    return { intent: "count_reviews_without_comments", filters: {} };
  }

  if (asksCount && /\bdistinct\s+reviewers?\b/.test(q)) {
    return { intent: "count_distinct_reviewers", filters: {} };
  }

  // —— Rating value counts ——
  const rating = extractRating(q);
  if (asksCount && aboutReviews && rating != null && !/\bor\s+higher\b|\bbelow\b/.test(q)) {
    return {
      intent: "count_reviews_by_rating",
      filters: { rating },
    };
  }
  if (asksCount && aboutReviews && /\bor\s+higher\b|\bat\s+least\b/.test(q)) {
    const minR = extractMinRating(q) ?? rating;
    if (minR != null) {
      return { intent: "count_reviews_min_rating", filters: { minRating: minR } };
    }
  }
  if (asksCount && aboutReviews && /\bbelow\b/.test(q)) {
    const maxR = extractMaxRating(q);
    if (maxR != null) {
      return { intent: "count_reviews_max_rating", filters: { maxRating: maxR } };
    }
  }

  const productId = extractProductId(q);
  if (asksCount && aboutReviews && productId != null) {
    return {
      intent: "count_reviews_for_product",
      filters: { productId },
    };
  }

  const reviewer = extractReviewerName(q);
  if (asksCount && aboutReviews && reviewer && /\bwrite|wrote|did\b/.test(q)) {
    return {
      intent: "count_reviews_by_reviewer",
      filters: { reviewerName: reviewer },
    };
  }

  const year = extractYear(q);
  if (asksCount && aboutReviews && year != null) {
    return { intent: "count_reviews_by_year", filters: { year } };
  }

  const category = extractCategory(q);
  if (asksCount && aboutReviews && category && /\bcategor/.test(q)) {
    return {
      intent: "count_reviews_for_category",
      filters: { category },
    };
  }

  if (
    /\breviews?\s+per\s+product\s+model\b/.test(q) ||
    /\breview\s+count\s+by\s+model\b/.test(q) ||
    (asksCount && aboutReviews && /\bper\s+product\s+model\b/.test(q))
  ) {
    return { intent: "review_count_by_model", filters: {} };
  }

  if (
    /\breview\s+count\s+by\s+product\b/.test(q) ||
    (asksCount && aboutReviews && /\bby\s+product\b/.test(q) && !aboutRating && !/\bcategor|\bmodel\b/.test(q))
  ) {
    return { intent: "review_count_by_product", filters: {} };
  }

  if (asksAvg && aboutReviews && /\bper\s+product\b/.test(q)) {
    return { intent: "avg_reviews_per_product", filters: {} };
  }
  if (/\baverage\s+number\s+of\s+reviews?\s+per\s+product\b/.test(q)) {
    return { intent: "avg_reviews_per_product", filters: {} };
  }

  // —— Products with reviews (after specific counts) ——
  if (
    /\bproducts?\s+reviewed\s+count\b/.test(q) ||
    /\bnumber\s+of\s+products?\s+with\s+reviews?\b/.test(q) ||
    (asksCount &&
      aboutProducts &&
      aboutReviews &&
      !/\bwithout\b|\bno\s+reviews?\b/.test(q) &&
      productId == null &&
      !/\bper\s+product\b/.test(q) &&
      !/\bby\s+product\b/.test(q) &&
      !/\bby\s+model\b/.test(q) &&
      !/\bcategor/.test(q) &&
      !/\bcomments?\b/.test(q) &&
      !/\baverage\b|\bavg\b|\bmean\b/.test(q))
  ) {
    return { intent: "count_products_with_reviews", filters: {} };
  }

  // —— Global rating aggregates ——
  if (/\bvariance\b/.test(q) && aboutRating) {
    return { intent: "variance_product_rating", filters: {} };
  }
  if (/\bmedian\b/.test(q) && aboutRating) {
    return { intent: "median_product_rating", filters: {} };
  }
  if (/\bminimum|min\b/.test(q) && aboutRating && !/\baverage\b/.test(q)) {
    return { intent: "min_product_rating", filters: {} };
  }
  if (/\bmaximum|max\b/.test(q) && aboutRating && !/\baverage\b/.test(q)) {
    return { intent: "max_product_rating", filters: {} };
  }
  if (/\bsum\b/.test(q) && aboutRating && aboutReviews) {
    return { intent: "sum_review_ratings", filters: {} };
  }

  if (/\bpercent|pct|%\b/.test(q) && rating != null) {
    return {
      intent: "pct_reviews_by_rating",
      filters: { rating },
    };
  }

  if (
    asksAvg &&
    aboutRating &&
    productId != null
  ) {
    return {
      intent: "average_rating_for_product",
      filters: { productId },
    };
  }

  if (asksAvg && aboutRating && extractMaxPrice(q) != null) {
    return {
      intent: "average_product_rating",
      filters: { maxPrice: extractMaxPrice(q) },
    };
  }

  // Dimension averages (more specific before "by product")
  if (asksAvg && aboutRating && /\bby\s+(product\s+)?subcategor/.test(q)) {
    return { intent: "avg_rating_by_subcategory", filters: {} };
  }
  if (asksAvg && aboutRating && /\bby\s+(product\s+)?categor/.test(q)) {
    return { intent: "avg_rating_by_category", filters: {} };
  }
  if (asksAvg && aboutRating && /\bby\s+(product\s+)?colou?r\b/.test(q)) {
    return { intent: "avg_rating_by_color", filters: {} };
  }
  if (
    asksAvg &&
    aboutRating &&
    (/\bby\s+(each\s+)?reviewer\b/.test(q) || /\beach\s+reviewer\b/.test(q))
  ) {
    return { intent: "avg_rating_by_reviewer", filters: {} };
  }
  if (asksAvg && aboutRating && /\bby\s+(review\s+)?year\b/.test(q)) {
    return { intent: "avg_rating_by_year", filters: {} };
  }
  if (asksAvg && aboutRating && /\bby\s+product\b/.test(q) && !/\bhighest|lowest\b/.test(q)) {
    return { intent: "avg_rating_by_product", filters: {} };
  }

  if (asksAvg && aboutRating) {
    return { intent: "average_product_rating", filters: {} };
  }

  // —— Distribution ——
  if (
    (aboutReviews || aboutRating) &&
    (/\bdistribution\b/.test(q) ||
      /\bhistogram\b/.test(q) ||
      /\bper\s+rating\b/.test(q) ||
      /\bgrouped\s+by\s+rating\b/.test(q) ||
      /\bby\s+rating\s+value\b/.test(q) ||
      (/\bcount\b/.test(q) && /\bby\s+rating\b/.test(q)))
  ) {
    return { intent: "reviews_by_rating", filters: {} };
  }

  if (/\breview\s+count\s+by\s+categor/.test(q) || (asksCount && aboutReviews && /\bby\s+categor/.test(q))) {
    return { intent: "review_count_by_category", filters: {} };
  }
  if (/\breview\s+count\s+by\s+month\b/.test(q) || (/\breviews?\b/.test(q) && /\bby\s+month\b/.test(q))) {
    return { intent: "review_count_by_month", filters: {} };
  }

  // —— Rankings ——
  if (/\bwhich\s+categor/.test(q) && /\bbest\s+average\s+rating\b/.test(q)) {
    return { intent: "top_category_by_avg_rating", filters: {} };
  }
  if (
    (/\bhighest\s+average\s+rating\b/.test(q) ||
      /\bbest\s+average\s+rating\b/.test(q) ||
      /\bhighest\s+rated\s+products?\b/.test(q) ||
      /\branked\s+by\s+average\s+rating\b/.test(q) ||
      (/\btop\s+\d+\b/.test(q) && /\baverage\s+rating\b/.test(q) && aboutProducts)) &&
    !/\blowest\b/.test(q) &&
    !/\bwhich\s+categor/.test(q)
  ) {
    const filters: Record<string, unknown> = { limit: extractTopN(q, 10) };
    const cat = extractCategory(q);
    if (cat) filters.category = cat;
    const minRc = extractMinReviewCount(q);
    if (minRc != null) filters.minReviewCount = minRc;
    return { intent: "products_highest_avg_rating", filters };
  }
  if (
    /\blowest\s+average\s+rating\b/.test(q) ||
    (/\bbottom\s+\d+\b/.test(q) && /\baverage\s+rating\b/.test(q))
  ) {
    return {
      intent: "products_lowest_avg_rating",
      filters: { limit: extractTopN(q, 10) },
    };
  }
  if (/\bmost\s+reviews\b/.test(q) && aboutProducts) {
    return {
      intent: "products_most_reviews",
      filters: { limit: extractTopN(q, 10) },
    };
  }
  if (/\bfewest\s+reviews\b/.test(q) && aboutProducts) {
    return {
      intent: "products_fewest_reviews",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (
    (aboutProducts && /\baverage\s+rating\s+of\s+\d\b/.test(q)) ||
    /\bperfect\s+average\s+rating\b/.test(q)
  ) {
    const filters: Record<string, unknown> = {
      avgRating: extractRating(q) ?? 5,
    };
    const minRc = extractMinReviewCount(q);
    if (minRc != null) filters.minReviewCount = minRc;
    return { intent: "products_with_avg_rating", filters };
  }

  if (/\bonly\s+have\s+1-?star\b/.test(q) || /\bonly\s+have\s+(\d)-?star\b/.test(q)) {
    return {
      intent: "products_only_rating",
      filters: { rating: extractRating(q) ?? 1 },
    };
  }

  // (top_category_by_avg_rating handled earlier in rankings)

  // —— Single review extremes ——
  if (/\bworst\s+(product\s+)?review\b/.test(q)) {
    return { intent: "worst_review", filters: {} };
  }
  if (/\bbest\s+(product\s+)?review\b/.test(q) && !/\baverage\b/.test(q)) {
    return { intent: "best_review", filters: {} };
  }
  if (/\bmost\s+recent\s+review\s+posted\b/.test(q) || /\bwhen\s+was\s+the\s+most\s+recent\s+review\b/.test(q)) {
    return { intent: "latest_review_date", filters: {} };
  }
  const hasListRatingFilters =
    rating != null ||
    /\bbelow\b/.test(q) ||
    /\bbetween\b/.test(q) ||
    /\bwith\s+comments?\b/.test(q) ||
    /\bempty\s+comments?\b/.test(q) ||
    extractLastMonths(q) != null ||
    extractColor(q) != null ||
    extractCommentContains(q) != null ||
    (productId != null && /\breviews?\b/.test(q));
  if (/\blatest\b/.test(q) && aboutReviews && !hasListRatingFilters) {
    return {
      intent: "latest_reviews",
      filters: { limit: extractTopN(q, 10) },
    };
  }
  if (/\boldest\b/.test(q) && aboutReviews && !hasListRatingFilters) {
    return {
      intent: "oldest_reviews",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (/\blongest\s+review\s+comments?\b/.test(q)) {
    return {
      intent: "longest_review_comments",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (/\bmost\s+reviews\b/.test(q) && /\breviewer\b/.test(q)) {
    return { intent: "top_reviewer_by_count", filters: {} };
  }
  if (/\blist\s+distinct\s+reviewer/.test(q) || /\blist\s+reviewers?\b/.test(q)) {
    return { intent: "list_reviewers", filters: {} };
  }

  const reviewId = extractReviewId(q);
  if (reviewId != null && (/\bshow\b/.test(q) || /\breview\s+\d+\b/.test(q))) {
    return { intent: "review_by_id", filters: { productReviewId: reviewId } };
  }

  if (/\brandom\s+sample\b/.test(q) && aboutReviews) {
    return {
      intent: "sample_reviews",
      filters: { limit: extractTopN(q, 10) },
    };
  }

  if (
    aboutProducts &&
    aboutReviews &&
    extractMinPrice(q) != null &&
    /\bwith\s+reviews?\b/.test(q)
  ) {
    return {
      intent: "list_reviewed_products",
      filters: { minPrice: extractMinPrice(q), limit: extractTopN(q, 25) },
    };
  }

  // —— list_reviews (1=1) ——
  if (
    aboutReviews &&
    (/\b(list|show|give)\b/.test(q) ||
      /\breviews?\s+with\b/.test(q) ||
      /\breviews?\s+for\b/.test(q) ||
      /\breviews?\s+that\b/.test(q) ||
      /\breviews?\s+rated\b/.test(q) ||
      /\breviews?\s+mention/.test(q) ||
      /\breviews?\s+from\b/.test(q) ||
      /\b\d-?star\s+reviews?\b/.test(q) ||
      /\bhelpful\b/.test(q))
  ) {
    const defaultLimit = /\bhelpful\b/.test(q) ? 10 : 25;
    const filters: Record<string, unknown> = { limit: extractTopN(q, defaultLimit) };
    let ok = false;

    if (rating != null) {
      filters.rating = rating;
      ok = true;
    }
    const minR = extractMinRating(q);
    const maxR = extractMaxRating(q);
    if (minR != null && /\bbetween\b/.test(q)) {
      filters.minRating = minR;
      ok = true;
    }
    if (maxR != null && (/\bbelow\b/.test(q) || /\bbetween\b/.test(q))) {
      filters.maxRating = maxR;
      ok = true;
    }
    if (productId != null) {
      filters.productId = productId;
      ok = true;
    }
    if (reviewer) {
      filters.reviewerName = reviewer;
      ok = true;
    }
    const comment = extractCommentContains(q);
    if (comment) {
      filters.commentContains = comment;
      ok = true;
    }
    if (
      /\bwith\s+comments?\b/.test(q) ||
      /\binclude\s+comments?\b/.test(q) ||
      /\bhave\s+comments?\b/.test(q) ||
      /\bhelpful\b/.test(q)
    ) {
      filters.hasComments = true;
      ok = true;
    }
    if (/\bempty\s+comments?\b/.test(q) || /\bno\s+comments?\b/.test(q) || /\bwithout\s+comments?\b/.test(q)) {
      filters.hasComments = false;
      ok = true;
    }
    const color = extractColor(q);
    if (color && (/\bproducts?\b/.test(q) || /\breviews?\s+for\b/.test(q))) {
      filters.color = color;
      ok = true;
    }
    const months = extractLastMonths(q);
    if (months != null) {
      filters.lastMonths = months;
      ok = true;
    }
    if (/\blatest\b/.test(q) || /\bsort.*latest\b/.test(q)) {
      filters.sort = "latest";
      ok = true;
    }
    if (ok || /\blist\s+reviews?\b/.test(q) || /\bshow\s+reviews?\b/.test(q) || /\bgive\s+reviews?\b/.test(q)) {
      return { intent: "list_reviews", filters };
    }
  }

  // Generic review count
  if (asksCount && aboutReviews && !aboutProducts) {
    return { intent: "count_reviews", filters: {} };
  }

  return null;
}

export const normalizeReviewFilters = (
  intent: string,
  filters: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...filters };
  const withLimit = [
    "products_highest_avg_rating",
    "products_lowest_avg_rating",
    "products_most_reviews",
    "products_fewest_reviews",
    "latest_reviews",
    "oldest_reviews",
    "list_reviews",
    "sample_reviews",
    "longest_review_comments",
    "list_reviewed_products",
  ];
  if (withLimit.includes(intent) && next.limit == null) {
    next.limit = intent.startsWith("latest") || intent.startsWith("oldest") ? 10 : 25;
  }
  return next;
}
