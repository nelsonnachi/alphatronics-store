// components/admin/products/product-dummy-data.ts

import type { AdminProduct } from "./product-types";

export const dummyAdminProducts: AdminProduct[] = [
  {
    id: "product-1",
    name: "Apple iPhone 15 Pro Max",
    slug: "apple-iphone-15-pro-max",
    sku: "APL-IP15PM-256",

    description:
      "Apple iPhone 15 Pro Max with titanium design, A17 Pro chip and advanced camera system.",

    shortDescription:
      "Premium iPhone with A17 Pro chip and titanium design.",

    categoryId: "category-phones",
    brandId: "brand-apple",

    price: "1850000",
    compareAtPrice: "1950000",
    costPrice: "1650000",
    currency: "NGN",

    stock: 24,
    reservedStock: 2,
    lowStockThreshold: 5,

    stockStatus: "in_stock",

    warrantyMonths: 12,
    weightKg: "0.221",

    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isActive: true,

    avgRating: "4.8",
    reviewCount: 128,
    soldCount: 245,

    metaTitle: "Apple iPhone 15 Pro Max",
    metaDescription:
      "Buy the Apple iPhone 15 Pro Max from Alphatronics.",

    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
    deletedAt: null,

    category: {
      id: "category-phones",
      name: "Smartphones",
      slug: "smartphones",
    },

    brand: {
      id: "brand-apple",
      name: "Apple",
      slug: "apple",
    },

    images: [
      {
        id: "image-1",
        productId: "product-1",
        url: "/images/products/iphone-15-pro-max.jpg",
        publicId: "alphatronics/products/iphone-15-pro-max",
        altText: "Apple iPhone 15 Pro Max",
        position: 0,
        isPrimary: true,
        createdAt: "2026-08-20T10:00:00.000Z",
      },
    ],

    specifications: [
      {
        id: "spec-1",
        productId: "product-1",
        group: "Display",
        key: "Screen Size",
        value: "6.7 inches",
        position: 0,
      },
      {
        id: "spec-2",
        productId: "product-1",
        group: "Performance",
        key: "Chip",
        value: "A17 Pro",
        position: 1,
      },
    ],

    variants: [
      {
        id: "variant-1",
        productId: "product-1",
        name: "256GB / Natural Titanium",
        sku: "APL-IP15PM-256-NAT",
        price: "1850000",
        compareAtPrice: "1950000",
        stock: 10,
        reservedStock: 1,
        imageUrl: null,
        imagePublicId: null,
        attributes: {
          storage: "256GB",
          color: "Natural Titanium",
        },
        isActive: true,
        createdAt: "2026-08-20T10:00:00.000Z",
      },
    ],
  },

  {
    id: "product-2",
    name: "Samsung Galaxy S25 Ultra",
    slug: "samsung-galaxy-s25-ultra",
    sku: "SAM-S25U-256",

    description:
      "Samsung Galaxy S25 Ultra with powerful performance, premium display and advanced camera system.",

    shortDescription:
      "Samsung flagship smartphone with premium performance.",

    categoryId: "category-phones",
    brandId: "brand-samsung",

    price: "1650000",
    compareAtPrice: "1750000",
    costPrice: "1480000",
    currency: "NGN",

    stock: 3,
    reservedStock: 1,
    lowStockThreshold: 5,

    stockStatus: "low_stock",

    warrantyMonths: 12,
    weightKg: "0.218",

    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,

    avgRating: "4.7",
    reviewCount: 94,
    soldCount: 173,

    metaTitle: "Samsung Galaxy S25 Ultra",
    metaDescription:
      "Buy the Samsung Galaxy S25 Ultra from Alphatronics.",

    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-09-12T10:00:00.000Z",
    deletedAt: null,

    category: {
      id: "category-phones",
      name: "Smartphones",
      slug: "smartphones",
    },

    brand: {
      id: "brand-samsung",
      name: "Samsung",
      slug: "samsung",
    },

    images: [
      {
        id: "image-2",
        productId: "product-2",
        url: "/images/products/samsung-s25-ultra.jpg",
        publicId: "alphatronics/products/samsung-s25-ultra",
        altText: "Samsung Galaxy S25 Ultra",
        position: 0,
        isPrimary: true,
        createdAt: "2026-08-25T10:00:00.000Z",
      },
    ],

    specifications: [],

    variants: [],
  },

  {
    id: "product-3",
    name: "LG 55 Inch OLED Smart TV",
    slug: "lg-55-inch-oled-smart-tv",
    sku: "LG-OLED-55-C4",

    description:
      "LG 55 inch OLED Smart TV with stunning picture quality and smart entertainment features.",

    shortDescription:
      "Premium 55 inch OLED Smart TV.",

    categoryId: "category-tvs",
    brandId: "brand-lg",

    price: "1450000",
    compareAtPrice: "1600000",
    costPrice: "1250000",
    currency: "NGN",

    stock: 0,
    reservedStock: 0,
    lowStockThreshold: 5,

    stockStatus: "out_of_stock",

    warrantyMonths: 24,
    weightKg: "18.5",

    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isActive: true,

    avgRating: "4.9",
    reviewCount: 67,
    soldCount: 91,

    metaTitle: "LG 55 Inch OLED Smart TV",
    metaDescription:
      "Buy LG OLED Smart TV from Alphatronics.",

    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-09-05T10:00:00.000Z",
    deletedAt: null,

    category: {
      id: "category-tvs",
      name: "Televisions",
      slug: "televisions",
    },

    brand: {
      id: "brand-lg",
      name: "LG",
      slug: "lg",
    },

    images: [
      {
        id: "image-3",
        productId: "product-3",
        url: "/images/products/lg-oled-tv.jpg",
        publicId: "alphatronics/products/lg-oled-tv",
        altText: "LG OLED Smart TV",
        position: 0,
        isPrimary: true,
        createdAt: "2026-07-15T10:00:00.000Z",
      },
    ],

    specifications: [],
    variants: [],
  },

  {
    id: "product-4",
    name: "Sony WH-1000XM5 Headphones",
    slug: "sony-wh-1000xm5",
    sku: "SONY-WH1000XM5",

    description:
      "Sony premium wireless noise cancelling headphones.",

    shortDescription:
      "Premium wireless noise cancelling headphones.",

    categoryId: "category-audio",
    brandId: "brand-sony",

    price: "520000",
    compareAtPrice: "580000",
    costPrice: "450000",
    currency: "NGN",

    stock: 17,
    reservedStock: 3,
    lowStockThreshold: 5,

    stockStatus: "in_stock",

    warrantyMonths: 12,
    weightKg: "0.25",

    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isActive: true,

    avgRating: "4.6",
    reviewCount: 52,
    soldCount: 138,

    metaTitle: "Sony WH-1000XM5",
    metaDescription: null,

    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-09-13T10:00:00.000Z",
    deletedAt: null,

    category: {
      id: "category-audio",
      name: "Audio",
      slug: "audio",
    },

    brand: {
      id: "brand-sony",
      name: "Sony",
      slug: "sony",
    },

    images: [
      {
        id: "image-4",
        productId: "product-4",
        url: "/images/products/sony-wh1000xm5.jpg",
        publicId: "alphatronics/products/sony-wh1000xm5",
        altText: "Sony WH-1000XM5",
        position: 0,
        isPrimary: true,
        createdAt: "2026-08-30T10:00:00.000Z",
      },
    ],

    specifications: [],
    variants: [],
  },
];