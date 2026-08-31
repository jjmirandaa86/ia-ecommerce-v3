/**
 * prompt.ts — Review section of the LLM classifier prompt.
 * Documents allowed intents and examples for Ollama.
 * Must stay aligned with intents.ts; contains no SQL execution logic.
 */
export const REVIEW_LLM_PROMPT = `## review (productreview)
Counts: count_products_with_reviews, count_products_without_reviews, count_reviews,
count_reviews_with_comments, count_reviews_without_comments, count_distinct_reviewers,
count_reviews_by_rating (filters.rating), count_reviews_min_rating (minRating),
count_reviews_max_rating (maxRating), count_reviews_for_product (productId),
count_reviews_by_reviewer (reviewerName), count_reviews_by_year (year),
count_reviews_for_category (category).

Aggregates: average_product_rating (optional maxPrice), average_rating_for_product (productId),
min_product_rating, max_product_rating, median_product_rating, sum_review_ratings,
avg_reviews_per_product, pct_reviews_by_rating (rating), variance_product_rating.

Distribution / rankings: reviews_by_rating, avg_rating_by_product, review_count_by_product,
products_highest_avg_rating / products_lowest_avg_rating (limit, optional category, minReviewCount),
products_most_reviews / products_fewest_reviews (limit),
products_with_avg_rating (avgRating, optional minReviewCount), products_only_rating (rating).

Singles / lists: worst_review, best_review, latest_reviews / oldest_reviews (limit),
latest_review_date, list_reviews (1=1 filters: rating, min/maxRating, productId, reviewerName,
commentContains, hasComments, color, lastMonths, sort, limit), list_reviewers,
list_reviewed_products (minPrice, limit), review_by_id (productReviewId), sample_reviews,
longest_review_comments, top_reviewer_by_count.

Dimensions: avg_rating_by_reviewer, avg_rating_by_year, review_count_by_month,
avg_rating_by_category / subcategory / color, review_count_by_category,
review_count_by_model (ProductModelID on product), top_category_by_avg_rating,
compare_avg_rating_categories (categories: [A,B]).

Examples:
"How many products have reviews?" → count_products_with_reviews
"How many reviews are there?" → count_reviews
"What is the average product rating?" → average_product_rating
"List reviews with rating 5" → list_reviews {rating:5}
"Top 5 products by average rating" → products_highest_avg_rating {limit:5}
Important: count_reviews ≠ count_products_with_reviews. Prefer review intents for review/rating
questions; do not emit free-form SQL. Product-only counts belong under product.`;
