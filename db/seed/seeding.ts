import "dotenv/config";

import { categories, brands } from "../schema";

import {
  categorySeedData,
  brandSeedData,
} from "./dummy-data";

import { db } from "../drizzle";

// ============================================================
// SEED DATABASE
// ============================================================

async function seed() {
  console.log("🌱 Seeding Alphatronics database...");

  // ==========================================================
  // 1. CATEGORIES
  // ==========================================================

  for (const category of categorySeedData) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,

        set: {
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
        },
      });
  }

  console.log(
    `✅ Seeded ${categorySeedData.length} categories`
  );

  // ==========================================================
  // 2. BRANDS
  // ==========================================================

  for (const brand of brandSeedData) {
    await db
      .insert(brands)
      .values(brand)
      .onConflictDoUpdate({
        target: brands.slug,

        set: {
          name: brand.name,
          description: brand.description,
          isActive: brand.isActive,
        },
      });
  }

  console.log(
    `✅ Seeded ${brandSeedData.length} brands`
  );

  // ==========================================================
  // DONE
  // ==========================================================

  console.log("🎉 Done seeding Alphatronics!");

  process.exit(0);
}

// ============================================================
// RUN SEED
// ============================================================

seed().catch((error) => {
  console.error("❌ Seed failed:", error);

  process.exit(1);
});