/**
 * Gold set — review entity (100 NL questions).
 *
 * expectedIntent / expectedFilters = what classify should return.
 * implemented = heuristic + SQL + format exist today (flip when you ship it).
 *
 * Run: npm run test:review-questions
 */
export type ReviewQuestionCase = {
  id: string;
  question: string;
  expectedIntent: string;
  expectedFilters?: Record<string, unknown>;
  implemented: boolean;
  notes?: string;
};

export const REVIEW_QUESTION_CASES: ReviewQuestionCase[] = [
  // —— Implemented today ——
  {
    id: "R001",
    question: "How many products have reviews?",
    expectedIntent: "count_products_with_reviews",
    implemented: true,
  },
  {
    id: "R002",
    question: "How many products have product reviews?",
    expectedIntent: "count_products_with_reviews",
    implemented: true,
  },
  {
    id: "R003",
    question: "Count products that have reviews",
    expectedIntent: "count_products_with_reviews",
    implemented: true,
  },
  {
    id: "R004",
    question: "How many reviews are there?",
    expectedIntent: "count_reviews",
    implemented: true,
  },
  {
    id: "R005",
    question: "What is the total number of reviews?",
    expectedIntent: "count_reviews",
    implemented: true,
  },
  {
    id: "R006",
    question: "Count all reviews",
    expectedIntent: "count_reviews",
    implemented: true,
  },
  {
    id: "R007",
    question: "What is the average product rating?",
    expectedIntent: "average_product_rating",
    implemented: true,
  },
  {
    id: "R008",
    question: "What is the average rating?",
    expectedIntent: "average_product_rating",
    implemented: true,
  },
  {
    id: "R009",
    question: "Average product rating overall",
    expectedIntent: "average_product_rating",
    implemented: true,
  },

  // —— Counts / coverage backlog ——
  {
    id: "R010",
    question: "How many products have no reviews?",
    expectedIntent: "count_products_without_reviews",
    implemented: true,
  },
  {
    id: "R011",
    question: "How many products are missing reviews?",
    expectedIntent: "count_products_without_reviews",
    implemented: true,
  },
  {
    id: "R012",
    question: "How many reviews have comments?",
    expectedIntent: "count_reviews_with_comments",
    implemented: true,
  },
  {
    id: "R013",
    question: "How many reviews have no comments?",
    expectedIntent: "count_reviews_without_comments",
    implemented: true,
  },
  {
    id: "R014",
    question: "How many distinct reviewers are there?",
    expectedIntent: "count_distinct_reviewers",
    implemented: true,
  },
  {
    id: "R015",
    question: "How many reviews have a 5-star rating?",
    expectedIntent: "count_reviews_by_rating",
    expectedFilters: { rating: 5 },
    implemented: true,
  },
  {
    id: "R016",
    question: "How many reviews have a 1-star rating?",
    expectedIntent: "count_reviews_by_rating",
    expectedFilters: { rating: 1 },
    implemented: true,
  },
  {
    id: "R017",
    question: "How many 4 star reviews are there?",
    expectedIntent: "count_reviews_by_rating",
    expectedFilters: { rating: 4 },
    implemented: true,
  },
  {
    id: "R018",
    question: "How many reviews are rated 3 or higher?",
    expectedIntent: "count_reviews_min_rating",
    expectedFilters: { minRating: 3 },
    implemented: true,
  },
  {
    id: "R019",
    question: "How many reviews are rated below 3?",
    expectedIntent: "count_reviews_max_rating",
    expectedFilters: { maxRating: 2 },
    implemented: true,
  },
  {
    id: "R020",
    question: "How many reviews does product 680 have?",
    expectedIntent: "count_reviews_for_product",
    expectedFilters: { productId: 680 },
    implemented: true,
  },

  // —— Aggregates / ratings ——
  {
    id: "R021",
    question: "What is the minimum product rating?",
    expectedIntent: "min_product_rating",
    implemented: true,
  },
  {
    id: "R022",
    question: "What is the maximum product rating?",
    expectedIntent: "max_product_rating",
    implemented: true,
  },
  {
    id: "R023",
    question: "What is the median product rating?",
    expectedIntent: "median_product_rating",
    implemented: true,
  },
  {
    id: "R024",
    question: "What is the average rating for product 680?",
    expectedIntent: "average_rating_for_product",
    expectedFilters: { productId: 680 },
    implemented: true,
  },
  {
    id: "R025",
    question: "Sum of all review ratings",
    expectedIntent: "sum_review_ratings",
    implemented: true,
  },
  {
    id: "R026",
    question: "Average number of reviews per product",
    expectedIntent: "avg_reviews_per_product",
    implemented: true,
  },
  {
    id: "R027",
    question: "What percent of reviews are 5 stars?",
    expectedIntent: "pct_reviews_by_rating",
    expectedFilters: { rating: 5 },
    implemented: true,
  },
  {
    id: "R028",
    question: "Rating distribution from 1 to 5",
    expectedIntent: "reviews_by_rating",
    implemented: true,
  },
  {
    id: "R029",
    question: "How many reviews per rating value?",
    expectedIntent: "reviews_by_rating",
    implemented: true,
  },
  {
    id: "R030",
    question: "Count reviews grouped by rating",
    expectedIntent: "reviews_by_rating",
    implemented: true,
  },

  // —— Per product rankings ——
  {
    id: "R031",
    question: "Which products have the highest average rating?",
    expectedIntent: "products_highest_avg_rating",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R032",
    question: "Which products have the lowest average rating?",
    expectedIntent: "products_lowest_avg_rating",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R033",
    question: "Top 5 products by average rating",
    expectedIntent: "products_highest_avg_rating",
    expectedFilters: { limit: 5 },
    implemented: true,
  },
  {
    id: "R034",
    question: "Bottom 5 products by average rating",
    expectedIntent: "products_lowest_avg_rating",
    expectedFilters: { limit: 5 },
    implemented: true,
  },
  {
    id: "R035",
    question: "Which products have the most reviews?",
    expectedIntent: "products_most_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R036",
    question: "Which products have the fewest reviews?",
    expectedIntent: "products_fewest_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R037",
    question: "Products with at least 3 reviews ranked by average rating",
    expectedIntent: "products_highest_avg_rating",
    expectedFilters: { limit: 10, minReviewCount: 3 },
    implemented: true,
  },
  {
    id: "R038",
    question: "Average rating by product",
    expectedIntent: "avg_rating_by_product",
    implemented: true,
  },
  {
    id: "R039",
    question: "Review count by product",
    expectedIntent: "review_count_by_product",
    implemented: true,
  },
  {
    id: "R040",
    question: "List products with average rating of 5",
    expectedIntent: "products_with_avg_rating",
    expectedFilters: { avgRating: 5 },
    implemented: true,
  },

  // —— Individual reviews ——
  {
    id: "R041",
    question: "What is the worst product review?",
    expectedIntent: "worst_review",
    implemented: true,
  },
  {
    id: "R042",
    question: "What is the best product review?",
    expectedIntent: "best_review",
    implemented: true,
  },
  {
    id: "R043",
    question: "Show the latest product reviews",
    expectedIntent: "latest_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R044",
    question: "Show the oldest product reviews",
    expectedIntent: "oldest_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R045",
    question: "Show the top 10 latest reviews",
    expectedIntent: "latest_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R046",
    question: "List reviews with rating 1",
    expectedIntent: "list_reviews",
    expectedFilters: { rating: 1, limit: 25 },
    implemented: true,
  },
  {
    id: "R047",
    question: "List reviews with rating 5",
    expectedIntent: "list_reviews",
    expectedFilters: { rating: 5, limit: 25 },
    implemented: true,
  },
  {
    id: "R048",
    question: "Show reviews for product 680",
    expectedIntent: "list_reviews",
    expectedFilters: { productId: 680, limit: 25 },
    implemented: true,
  },
  {
    id: "R049",
    question: "Show review 1",
    expectedIntent: "review_by_id",
    expectedFilters: { productReviewId: 1 },
    implemented: true,
  },
  {
    id: "R050",
    question: "Reviews that mention quality in comments",
    expectedIntent: "list_reviews",
    expectedFilters: { commentContains: "quality", limit: 25 },
    implemented: true,
  },

  // —— Reviewers ——
  {
    id: "R051",
    question: "List distinct reviewer names",
    expectedIntent: "list_reviewers",
    implemented: true,
  },
  {
    id: "R052",
    question: "Which reviewer wrote the most reviews?",
    expectedIntent: "top_reviewer_by_count",
    implemented: true,
  },
  {
    id: "R053",
    question: "How many reviews did John write?",
    expectedIntent: "count_reviews_by_reviewer",
    expectedFilters: { reviewerName: "John" },
    implemented: true,
  },
  {
    id: "R054",
    question: "Show reviews by reviewer David",
    expectedIntent: "list_reviews",
    expectedFilters: { reviewerName: "David", limit: 25 },
    implemented: true,
  },
  {
    id: "R055",
    question: "Average rating given by each reviewer",
    expectedIntent: "avg_rating_by_reviewer",
    implemented: true,
  },

  // —— Dates ——
  {
    id: "R056",
    question: "How many reviews were written in 2007?",
    expectedIntent: "count_reviews_by_year",
    expectedFilters: { year: 2007 },
    implemented: true,
  },
  {
    id: "R057",
    question: "Reviews from the last 12 months",
    expectedIntent: "list_reviews",
    expectedFilters: { lastMonths: 12, limit: 25 },
    implemented: true,
  },
  {
    id: "R058",
    question: "Average rating by review year",
    expectedIntent: "avg_rating_by_year",
    implemented: true,
  },
  {
    id: "R059",
    question: "Review count by month",
    expectedIntent: "review_count_by_month",
    implemented: true,
  },
  {
    id: "R060",
    question: "When was the most recent review posted?",
    expectedIntent: "latest_review_date",
    implemented: true,
  },

  // —— Joins with product attributes ——
  {
    id: "R061",
    question: "Average rating by product category",
    expectedIntent: "avg_rating_by_category",
    implemented: true,
  },
  {
    id: "R062",
    question: "Average rating by product subcategory",
    expectedIntent: "avg_rating_by_subcategory",
    implemented: true,
  },
  {
    id: "R063",
    question: "Average rating by product color",
    expectedIntent: "avg_rating_by_color",
    implemented: true,
  },
  {
    id: "R064",
    question: "How many reviews for products in category Bikes?",
    expectedIntent: "count_reviews_for_category",
    expectedFilters: { category: "Bikes" },
    implemented: true,
  },
  {
    id: "R065",
    question: "Highest rated products in category Clothing",
    expectedIntent: "products_highest_avg_rating",
    expectedFilters: { category: "Clothing", limit: 10 },
    implemented: true,
  },
  {
    id: "R066",
    question: "Reviews for black products",
    expectedIntent: "list_reviews",
    expectedFilters: { color: "Black", limit: 25 },
    implemented: true,
  },
  {
    id: "R067",
    question: "Average rating for products under $50",
    expectedIntent: "average_product_rating",
    expectedFilters: { maxPrice: 50 },
    implemented: true,
    notes: "Extend average_product_rating with join + price filter",
  },
  {
    id: "R068",
    question: "Products with reviews and list price over 1000",
    expectedIntent: "list_reviewed_products",
    expectedFilters: { minPrice: 1000, limit: 25 },
    implemented: true,
  },
  {
    id: "R069",
    question: "Review count by category",
    expectedIntent: "review_count_by_category",
    implemented: true,
  },
  {
    id: "R070",
    question: "Which category has the best average rating?",
    expectedIntent: "top_category_by_avg_rating",
    implemented: true,
  },

  // —— Comment / text ——
  {
    id: "R071",
    question: "Show reviews with empty comments",
    expectedIntent: "list_reviews",
    expectedFilters: { hasComments: false, limit: 25 },
    implemented: true,
  },
  {
    id: "R072",
    question: "Show reviews that include comments",
    expectedIntent: "list_reviews",
    expectedFilters: { hasComments: true, limit: 25 },
    implemented: true,
  },
  {
    id: "R073",
    question: "Longest review comments",
    expectedIntent: "longest_review_comments",
    expectedFilters: { limit: 10 },
    implemented: true,
  },
  {
    id: "R074",
    question: "Reviews mentioning defective",
    expectedIntent: "list_reviews",
    expectedFilters: { commentContains: "defective", limit: 25 },
    implemented: true,
  },
  {
    id: "R075",
    question: "5-star reviews with comments",
    expectedIntent: "list_reviews",
    expectedFilters: { rating: 5, hasComments: true, limit: 25 },
    implemented: true,
  },

  // —— Combined filters (list_reviews 1=1 style) ——
  {
    id: "R076",
    question: "Show 5-star reviews for product 680",
    expectedIntent: "list_reviews",
    expectedFilters: { productId: 680, rating: 5, limit: 25 },
    implemented: true,
  },
  {
    id: "R077",
    question: "Latest 5 reviews with rating below 3",
    expectedIntent: "list_reviews",
    expectedFilters: { maxRating: 2, limit: 5, sort: "latest" },
    implemented: true,
  },
  {
    id: "R078",
    question: "Reviews rated between 2 and 4",
    expectedIntent: "list_reviews",
    expectedFilters: { minRating: 2, maxRating: 4, limit: 25 },
    implemented: true,
  },
  {
    id: "R079",
    question: "Give reviews that rating is 5 and have comments",
    expectedIntent: "list_reviews",
    expectedFilters: { rating: 5, hasComments: true, limit: 25 },
    implemented: true,
  },
  {
    id: "R080",
    question: "Random sample of 10 reviews",
    expectedIntent: "sample_reviews",
    expectedFilters: { limit: 10 },
    implemented: true,
  },

  // —— Paraphrases / edges ——
  {
    id: "R081",
    question: "Total reviews count please",
    expectedIntent: "count_reviews",
    implemented: true,
  },
  {
    id: "R082",
    question: "Mean product rating",
    expectedIntent: "average_product_rating",
    implemented: true,
  },
  {
    id: "R083",
    question: "Number of products with reviews",
    expectedIntent: "count_products_with_reviews",
    implemented: true,
  },
  {
    id: "R084",
    question: "Products reviewed count",
    expectedIntent: "count_products_with_reviews",
    implemented: true,
    notes: "May need heuristic phrase; intent exists",
  },
  {
    id: "R085",
    question: "Avg rating across all reviews",
    expectedIntent: "average_product_rating",
    implemented: true,
  },
  {
    id: "R086",
    question: "Star rating histogram",
    expectedIntent: "reviews_by_rating",
    implemented: true,
  },
  {
    id: "R087",
    question: "Most helpful sounding 5-star reviews",
    expectedIntent: "list_reviews",
    expectedFilters: { rating: 5, hasComments: true, limit: 10 },
    implemented: true,
    notes: "No helpfulness column — map to 5-star with comments",
  },
  {
    id: "R088",
    question: "Unreviewed finished goods products",
    expectedIntent: "count_products_without_reviews",
    expectedFilters: { finishedGoodsFlag: true },
    implemented: true,
  },
  {
    id: "R089",
    question: "Compare average rating of Bikes vs Clothing",
    expectedIntent: "compare_avg_rating_categories",
    expectedFilters: { categories: ["Bikes", "Clothing"] },
    implemented: true,
  },
  {
    id: "R090",
    question: "Products with perfect average rating and at least 2 reviews",
    expectedIntent: "products_with_avg_rating",
    expectedFilters: { avgRating: 5, minReviewCount: 2 },
    implemented: true,
  },

  // —— Negatives / out of scope ——
  {
    id: "R091",
    question: "Delete all reviews",
    expectedIntent: "no_match",
    implemented: true,
  },
  {
    id: "R092",
    question: "Update all ratings to 5",
    expectedIntent: "no_match",
    implemented: true,
  },
  {
    id: "R093",
    question: "asdf qwer review zxcv",
    expectedIntent: "no_match",
    implemented: true,
  },
  {
    id: "R094",
    question: "How many products are there?",
    expectedIntent: "count_products",
    implemented: true,
    notes: "Cross-domain: product module must win; review must not steal",
  },
  {
    id: "R095",
    question: "What is the total stock?",
    expectedIntent: "no_match",
    implemented: true,
    notes: "Inventory — neither review nor product should match today",
  },

  // —— More backlog ——
  {
    id: "R096",
    question: "Show reviewer name and rating for the latest 20 reviews",
    expectedIntent: "latest_reviews",
    expectedFilters: { limit: 20 },
    implemented: true,
  },
  {
    id: "R097",
    question: "Products that only have 1-star reviews",
    expectedIntent: "products_only_rating",
    expectedFilters: { rating: 1 },
    implemented: true,
  },
  {
    id: "R098",
    question: "Variance of product ratings",
    expectedIntent: "variance_product_rating",
    implemented: true,
  },
  {
    id: "R099",
    question: "How many reviews per product model?",
    expectedIntent: "review_count_by_model",
    implemented: true,
    notes: "May need ProductModelID join from product only",
  },
  {
    id: "R100",
    question: "Show a random sample of 15 product reviews",
    expectedIntent: "sample_reviews",
    expectedFilters: { limit: 15 },
    implemented: true,
  },
];

export const reviewQuestionStats = () => {
  const total = REVIEW_QUESTION_CASES.length;
  const implemented = REVIEW_QUESTION_CASES.filter((c) => c.implemented).length;
  return {
    total,
    implemented,
    backlog: total - implemented,
  };
}
