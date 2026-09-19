import {
  pgTable,
  pgEnum,
  text,
  uuid,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { brands } from "./brands";

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "preorder",
  "discontinued",
]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
    brandId: uuid("brand_id").references(() => brands.id, {onDelete: "set null"}),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("NGN"),
    stock: integer("stock").notNull().default(0),
    reservedStock: integer("reserved_stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    stockStatus: stockStatusEnum("stock_status").notNull().default("in_stock"),

    // electronics-specific
    warrantyMonths: integer("warranty_months").notNull().default(12),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),

    isFeatured: boolean("is_featured").notNull().default(false),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
    soldCount: integer("sold_count").notNull().default(0),

    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // soft delete
  },
  (table) => ({
    skuLookupIdx: index("products_sku_lookup_idx").on(table.sku),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    brandIdx: index("products_brand_idx").on(table.brandId),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    activeIdx: index("products_active_idx").on(table.isActive),
    priceIdx: index("products_price_idx").on(table.price),
  }),
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    altText: text("alt_text"),
    position: integer("position").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_images_product_idx").on(table.productId),
  }),
);

// Free-form technical specs: "RAM" -> "16GB", grouped for a nice spec-table UI
export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    group: text("group").notNull().default("General"), // e.g. "Display", "Performance", "Connectivity"
    key: text("key").notNull(), // e.g. "Screen Size"
    value: text("value").notNull(), // e.g. "6.7 inches"
    position: integer("position").notNull().default(0),
  },
  (table) => ({
    productIdx: index("product_specs_product_idx").on(table.productId),
  }),
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // "128GB / Midnight Black"
    sku: text("sku").notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    reservedStock: integer("reserved_stock").notNull().default(0),
    imageUrl: text("image_url"),
    imagePublicId: text("image_public_id"),
    // e.g. { "color": "Midnight Black", "storage": "128GB" }
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },(table) => ({
    productIdx: index("product_variants_product_idx").on(table.productId),
    skuIdx: index("product_variants_sku_idx").on(table.sku),
  }),
);