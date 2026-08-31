/**
 * format.ts — Product natural-language answers.
 * Turns executed query rows into English chat replies.
 * No SQL templates or classification rules belong here.
 */
import type { QueryPlan } from "@/query-agent/domain/intent-module";

export const formatProductAnswer = (
  plan: QueryPlan,
  rows: Record<string, unknown>[],
): string | null => {
  if (plan.intent === "count_products") {
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There are ${count} product${count === 1 ? "" : "s"} in total.`;
  }
  if (plan.intent === "count_products_without_subcategory") {
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} product${count === 1 ? "" : "s"} with no subcategory.`;
  }
  if (plan.intent === "products_by_category") {
    if (!rows.length) return "No products were found by category.";
    const lines = rows.map((r) => {
      const cat = String(r.category ?? r.Name ?? "Unknown");
      const raw = r.productCount ?? r.productcount ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      return `• ${cat}: ${Number.isFinite(n) ? n : 0}`;
    });
    return `Product totals by category:\n${lines.join("\n")}`;
  }
  if (plan.intent === "avg_list_price_by_category") {
    if (!rows.length) return "No average list prices were found by category.";
    const lines = rows.map((r) => {
      const cat = String(r.category ?? r.Name ?? "Unknown");
      const raw = r.avgListPrice ?? r.avglistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${cat}: $${formatted}`;
    });
    return `Average list price by category:\n${lines.join("\n")}`;
  }
  if (plan.intent === "avg_list_price_by_subcategory") {
    if (!rows.length) return "No average list prices were found by subcategory.";
    const lines = rows.map((r) => {
      const name = String(r.subcategory ?? r.Name ?? "Unknown");
      const raw = r.avgListPrice ?? r.avglistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${name}: $${formatted}`;
    });
    return `Average list price by subcategory:\n${lines.join("\n")}`;
  }
  if (plan.intent === "avg_list_price_by_color") {
    if (!rows.length) return "No average list prices were found by color.";
    const lines = rows.map((r) => {
      const name = String(r.color ?? r.Color ?? "Unknown");
      const raw = r.avgListPrice ?? r.avglistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${name}: $${formatted}`;
    });
    return `Average list price by color:\n${lines.join("\n")}`;
  }
  if (plan.intent === "min_list_price_by_category") {
    if (!rows.length) return "No minimum list prices were found by category.";
    const lines = rows.map((r) => {
      const cat = String(r.category ?? r.Name ?? "Unknown");
      const raw = r.minListPrice ?? r.minlistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${cat}: $${formatted}`;
    });
    return `Minimum list price by category:\n${lines.join("\n")}`;
  }
  if (plan.intent === "max_list_price_by_category") {
    if (!rows.length) return "No maximum list prices were found by category.";
    const lines = rows.map((r) => {
      const cat = String(r.category ?? r.Name ?? "Unknown");
      const raw = r.maxListPrice ?? r.maxlistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${cat}: $${formatted}`;
    });
    return `Maximum list price by category:\n${lines.join("\n")}`;
  }
  if (plan.intent === "sum_list_price_by_category") {
    if (!rows.length) return "No sum of list prices were found by category.";
    const lines = rows.map((r) => {
      const cat = String(r.category ?? r.Name ?? "Unknown");
      const raw = r.sumListPrice ?? r.sumlistprice ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      const formatted = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return `• ${cat}: $${formatted}`;
    });
    return `Sum of list prices by category:\n${lines.join("\n")}`;
  }
  if (plan.intent === "count_products_without_color") {
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} product${count === 1 ? "" : "s"} with no color.`;
  }
  if (plan.intent === "count_products_with_color") {
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} product${count === 1 ? "" : "s"} with a color assigned.`;
  }
  if (plan.intent === "count_categories") {
    const raw = rows[0]?.categoryCount ?? rows[0]?.categorycount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} product categor${count === 1 ? "y" : "ies"}.`;
  }
  if (plan.intent === "count_subcategories") {
    const raw = rows[0]?.subcategoryCount ?? rows[0]?.subcategorycount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} product subcategor${count === 1 ? "y" : "ies"}.`;
  }
  if (plan.intent === "list_categories") {
    if (!rows.length) return "No product categories were found.";
    const lines = rows.map((r) => `• ${String(r.category ?? r.Name ?? "Unknown")}`);
    return `Product categories:\n${lines.join("\n")}`;
  }
  if (plan.intent === "list_subcategories") {
    if (!rows.length) return "No product subcategories were found.";
    const lines = rows.map(
      (r) => `• ${String(r.subcategory ?? r.Name ?? "Unknown")}`,
    );
    return `Product subcategories:\n${lines.join("\n")}`;
  }
  if (plan.intent === "top_category_by_product_count") {
    if (!rows.length) return "No category product totals were found.";
    const cat = String(rows[0]?.category ?? "Unknown");
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    return `The category with the most products is ${cat} (${Number.isFinite(n) ? n : 0}).`;
  }
  if (plan.intent === "bottom_subcategory_by_product_count") {
    if (!rows.length) return "No subcategory product totals were found.";
    const name = String(rows[0]?.subcategory ?? "Unknown");
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    return `The subcategory with the fewest products is ${name} (${Number.isFinite(n) ? n : 0}).`;
  }
  if (plan.intent === "top_color_by_product_count") {
    if (!rows.length) return "No color product totals were found.";
    const color = String(rows[0]?.color ?? rows[0]?.Color ?? "Unknown");
    const raw = rows[0]?.productCount ?? rows[0]?.productcount ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    return `The most common product color is ${color} (${Number.isFinite(n) ? n : 0} products).`;
  }
  if (plan.intent === "avg_list_price") {
    const raw = rows[0]?.avgListPrice ?? rows[0]?.avglistprice ?? null;
    if (raw == null) return "No average list price was found.";
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    if (!Number.isFinite(n)) return "No average list price was found.";
    const scope =
      plan.filters.category != null
        ? ` for category ${String(plan.filters.category)}`
        : "";
    return `The overall average list price${scope} is $${n.toFixed(2)}.`;
  }
  if (plan.intent === "median_list_price") {
    const raw = rows[0]?.medianListPrice ?? rows[0]?.medianlistprice ?? null;
    if (raw == null) return "No median list price was found.";
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    if (!Number.isFinite(n)) return "No median list price was found.";
    return `The median list price is $${n.toFixed(2)}.`;
  }
  if (plan.intent === "cheapest_product") {
    if (!rows.length) return "No cheapest product was found.";
    const name = String(rows[0]?.productName ?? rows[0]?.Name ?? "Unknown");
    const priceRaw = rows[0]?.listPrice ?? rows[0]?.ListPrice ?? 0;
    const price =
      typeof priceRaw === "bigint" ? Number(priceRaw) : Number(priceRaw);
    return `The cheapest product is ${name} at $${Number.isFinite(price) ? price.toFixed(2) : "0.00"}.`;
  }
  if (plan.intent === "most_expensive_product") {
    if (!rows.length) return "No most expensive product was found.";
    const name = String(rows[0]?.productName ?? rows[0]?.Name ?? "Unknown");
    const priceRaw = rows[0]?.listPrice ?? rows[0]?.ListPrice ?? 0;
    const price =
      typeof priceRaw === "bigint" ? Number(priceRaw) : Number(priceRaw);
    return `The most expensive product is ${name} at $${Number.isFinite(price) ? price.toFixed(2) : "0.00"}.`;
  }
  if (plan.intent === "products_by_subcategory") {
    if (!rows.length) return "No products were found by subcategory.";
    const lines = rows.map((r) => {
      const name = String(r.subcategory ?? r.Name ?? "Unknown");
      const raw = r.productCount ?? r.productcount ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      return `• ${name}: ${Number.isFinite(n) ? n : 0}`;
    });
    return `Product totals by subcategory:\n${lines.join("\n")}`;
  }
  if (plan.intent === "products_by_color") {
    if (!rows.length) return "No products were found by color.";
    const lines = rows.map((r) => {
      const name = String(r.color ?? r.Color ?? "Unknown");
      const raw = r.productCount ?? r.productcount ?? 0;
      const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
      return `• ${name}: ${Number.isFinite(n) ? n : 0}`;
    });
    return `Product totals by color:\n${lines.join("\n")}`;
  }
  if (plan.intent === "top_expensive_products") {
    if (!rows.length) return "No expensive products were found.";
    const limit = Number(plan.filters.limit ?? rows.length);
    const lines = rows.map((r, i) => {
      const name = String(r.productName ?? r.Name ?? "Unknown");
      const priceRaw = r.listPrice ?? r.ListPrice ?? 0;
      const price =
        typeof priceRaw === "bigint" ? Number(priceRaw) : Number(priceRaw);
      const formatted = Number.isFinite(price) ? price.toFixed(2) : "0.00";
      return `${i + 1}. ${name} — $${formatted}`;
    });
    return `Top ${Number.isFinite(limit) ? limit : rows.length} most expensive products:\n${lines.join("\n")}`;
  }
  if (plan.intent === "cheapest_products_under_price") {
    const maxPrice = Number(plan.filters.maxPrice ?? 50);
    if (!rows.length) {
      return `No products were found under $${Number.isFinite(maxPrice) ? maxPrice.toFixed(2) : "50.00"}.`;
    }
    const lines = rows.map((r, i) => {
      const name = String(r.productName ?? r.Name ?? "Unknown");
      const priceRaw = r.listPrice ?? r.ListPrice ?? 0;
      const price =
        typeof priceRaw === "bigint" ? Number(priceRaw) : Number(priceRaw);
      const formatted = Number.isFinite(price) ? price.toFixed(2) : "0.00";
      return `${i + 1}. ${name} — $${formatted}`;
    });
    const cap = Number.isFinite(maxPrice) ? maxPrice.toFixed(2) : "50.00";
    return `Cheapest products under $${cap}:\n${lines.join("\n")}`;
  }
  if (plan.intent === "list_products") {
    const bits: string[] = [];
    if (plan.filters.minPrice != null) bits.push(`over $${Number(plan.filters.minPrice)}`);
    if (plan.filters.maxPrice != null) bits.push(`under $${Number(plan.filters.maxPrice)}`);
    if (plan.filters.color != null) bits.push(`color ${String(plan.filters.color)}`);
    if (Array.isArray(plan.filters.colors)) bits.push(`colors ${plan.filters.colors.join("/")}`);
    if (plan.filters.size != null) bits.push(`size ${String(plan.filters.size)}`);
    if (plan.filters.category != null) bits.push(`category ${String(plan.filters.category)}`);
    if (plan.filters.subcategory != null) bits.push(`subcategory ${String(plan.filters.subcategory)}`);
    if (plan.filters.nameContains != null) bits.push(`name like ${String(plan.filters.nameContains)}`);
    if (plan.filters.productNumberPrefix != null) bits.push(`number ${String(plan.filters.productNumberPrefix)}*`);
    if (plan.filters.productLine != null) bits.push(`line ${String(plan.filters.productLine)}`);
    if (plan.filters.finishedGoodsFlag === false) bits.push("not finished goods");
    if (plan.filters.minDaysToManufacture != null) bits.push(`days to manufacture > ${String(plan.filters.minDaysToManufacture)}`);
    if (plan.filters.minReorderPoint != null) bits.push(`reorder point > ${String(plan.filters.minReorderPoint)}`);
    if (plan.filters.sellStartYear != null) bits.push(`sell start ${String(plan.filters.sellStartYear)}`);
    const scope = bits.length ? bits.join(", ") : "your filters";
    if (!rows.length) return `No products were found with ${scope}.`;
    const lines = rows.map((r, i) => {
      const name = String(r.productName ?? r.Name ?? "Unknown");
      const priceRaw = r.listPrice ?? r.ListPrice ?? 0;
      const price = typeof priceRaw === "bigint" ? Number(priceRaw) : Number(priceRaw);
      const color = String(r.color ?? r.Color ?? "No color");
      return `${i + 1}. ${name} — $${Number.isFinite(price) ? price.toFixed(2) : "0.00"} (${color})`;
    });
    return `Products with ${scope}:\n${lines.join("\n")}`;
  }

  const countMsg = (key: string, singular: string, plural: string) => {
    const raw = rows[0]?.[key] ?? rows[0]?.[key.toLowerCase()] ?? 0;
    const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
    const count = Number.isFinite(n) ? n : 0;
    return `There ${count === 1 ? "is" : "are"} ${count} ${count === 1 ? singular : plural}.`;
  };

  if (plan.intent === "count_products_under_price") {
    return countMsg("productCount", "product under the price cap", "products under the price cap");
  }
  if (plan.intent === "count_products_over_price") {
    return countMsg("productCount", "product over the price floor", "products over the price floor");
  }
  if (plan.intent === "count_products_zero_price") {
    return countMsg("productCount", "product with zero list price", "products with zero list price");
  }
  if (plan.intent === "count_products_make_flag") {
    return countMsg("productCount", "make-to-order product", "make-to-order products");
  }
  if (plan.intent === "count_finished_goods") {
    return countMsg("productCount", "finished-goods product", "finished-goods products");
  }
  if (plan.intent === "count_sellable_products") {
    return countMsg("productCount", "currently sellable product", "currently sellable products");
  }
  if (plan.intent === "count_products_zero_safety_stock") {
    return countMsg("productCount", "product with zero safety stock", "products with zero safety stock");
  }
  if (plan.intent === "count_products_without_model") {
    return countMsg("productCount", "product without a product model", "products without a product model");
  }
  if (plan.intent === "count_distinct_colors") {
    return countMsg("colorCount", "unique color", "unique colors");
  }
  if (plan.intent === "list_product_lines") {
    if (!rows.length) return "No product lines were found.";
    return `Product lines:\n${rows.map((r) => `• ${String(r.productLine ?? "Unknown")}`).join("\n")}`;
  }
  if (plan.intent === "list_discontinued_products") {
    if (!rows.length) return "No discontinued products were found.";
    return `Discontinued products:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName ?? "Unknown")}`).join("\n")}`;
  }
  if (plan.intent === "top_cheapest_products") {
    if (!rows.length) return "No cheap products were found.";
    return `Cheapest products:\n${rows.map((r, i) => {
      const price = Number(r.listPrice ?? 0);
      return `${i + 1}. ${String(r.productName)} — $${price.toFixed(2)}`;
    }).join("\n")}`;
  }
  if (plan.intent === "top_heavy_products") {
    if (!rows.length) return "No heavy products were found.";
    return `Heaviest products:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName)} — weight ${String(r.weight)}`).join("\n")}`;
  }
  if (plan.intent === "products_price_above_cost") {
    if (!rows.length) return "No products with price above cost were found.";
    return `Products with list price greater than standard cost:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName)}`).join("\n")}`;
  }
  if (plan.intent === "avg_margin_by_category") {
    if (!rows.length) return "No margins were found by category.";
    return `Average margin by category:\n${rows.map((r) => `• ${String(r.category)}: $${Number(r.avgMargin ?? 0).toFixed(2)}`).join("\n")}`;
  }
  if (plan.intent === "products_by_size") {
    if (!rows.length) return "No products were found by size.";
    return `Product totals by size:\n${rows.map((r) => `• ${String(r.size)}: ${Number(r.productCount ?? 0)}`).join("\n")}`;
  }
  if (plan.intent === "products_by_class") {
    if (!rows.length) return "No products were found by class.";
    return `Product totals by class:\n${rows.map((r) => `• ${String(r.class)}: ${Number(r.productCount ?? 0)}`).join("\n")}`;
  }
  if (plan.intent === "products_by_style") {
    if (!rows.length) return "No products were found by style.";
    return `Product totals by style:\n${rows.map((r) => `• ${String(r.style)}: ${Number(r.productCount ?? 0)}`).join("\n")}`;
  }
  if (plan.intent === "products_by_model") {
    if (!rows.length) return "No products were found by model.";
    return `Product totals by model ID:\n${rows.map((r) => `• model ${String(r.productModelId)}: ${Number(r.productCount ?? 0)}`).join("\n")}`;
  }
  if (plan.intent === "avg_weight_by_category") {
    if (!rows.length) return "No average weights were found by category.";
    return `Average weight by category:\n${rows.map((r) => `• ${String(r.category)}: ${Number(r.avgWeight ?? 0).toFixed(2)}`).join("\n")}`;
  }
  if (plan.intent === "avg_days_to_manufacture_by_category") {
    if (!rows.length) return "No average days to manufacture were found by category.";
    return `Average days to manufacture by category:\n${rows.map((r) => `• ${String(r.category)}: ${Number(r.avgDays ?? 0).toFixed(2)}`).join("\n")}`;
  }
  if (plan.intent === "list_products_by_weight") {
    if (!rows.length) return "No products matched the weight filter.";
    return `Lightest products under weight cap:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName)} — weight ${String(r.weight)}`).join("\n")}`;
  }
  if (plan.intent === "product_by_id") {
    if (!rows.length) return "No product was found for that id.";
    const r = rows[0];
    return `Product ${String(r.productId)}: ${String(r.productName)} — $${Number(r.listPrice ?? 0).toFixed(2)} (${String(r.color)}).`;
  }
  if (plan.intent === "product_list_price_by_id") {
    if (!rows.length) return "No list price was found for that product.";
    const r = rows[0];
    return `The list price of ${String(r.productName)} is $${Number(r.listPrice ?? 0).toFixed(2)}.`;
  }
  if (plan.intent === "newest_products_by_sell_start") {
    if (!rows.length) return "No products with sell start dates were found.";
    return `Newest products by sell start date:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName)}`).join("\n")}`;
  }
  if (plan.intent === "subcategories_by_category") {
    if (!rows.length) return "No subcategories were found for that category.";
    return `Subcategories:\n${rows.map((r) => `• ${String(r.subcategory)}`).join("\n")}`;
  }
  if (plan.intent === "category_for_subcategory") {
    if (!rows.length) return "No category was found for that subcategory.";
    return `Subcategory ${String(rows[0].subcategory)} belongs to category ${String(rows[0].category)}.`;
  }
  if (plan.intent === "compare_avg_price_categories") {
    if (!rows.length) return "No average prices were found for those categories.";
    return `Average list price comparison:\n${rows.map((r) => `• ${String(r.category)}: $${Number(r.avgListPrice ?? 0).toFixed(2)}`).join("\n")}`;
  }
  if (plan.intent === "sample_products") {
    if (!rows.length) return "No sample products were found.";
    return `Random product sample:\n${rows.map((r, i) => `${i + 1}. ${String(r.productName)} — $${Number(r.listPrice ?? 0).toFixed(2)}`).join("\n")}`;
  }
  return null;
}
