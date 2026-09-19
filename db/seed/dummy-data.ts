/**
 * Static seed data for Alphatronics.
 *
 * Used by db/seed/seeding.ts to populate
 * categories and brands.
 */

// ============================================================
// CATEGORIES
// ============================================================

export const categorySeedData = [
  {
    name: "Laptops & Computers",
    slug: "laptops-computers",
    description: "Laptops, desktops, and computer hardware.",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Smartphones & Tablets",
    slug: "smartphones-tablets",
    description: "Smartphones, tablets, and mobile devices.",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Audio & Headphones",
    slug: "audio-headphones",
    description: "Headphones, earbuds, speakers, and audio equipment.",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "TV & Home Theater",
    slug: "tv-home-theater",
    description: "Smart TVs, displays, sound systems, and home theater equipment.",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming consoles, controllers, and gaming accessories.",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Chargers, cables, cases, power banks, and other electronics accessories.",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    description: "Smart devices and connected home technology.",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Home Appliances",
    slug: "home-appliances",
    description: "Kitchen appliances, cooling appliances, and home electronics.",
    isActive: true,
    isFeatured: false,
  },
] as const;

// ============================================================
// BRANDS
// ============================================================

export const brandSeedData = [
  {
    name: "Apple",
    slug: "apple",
    description: "Innovative technology and premium electronics.",
    isActive: true,
  },
  {
    name: "Samsung",
    slug: "samsung",
    description: "Consumer electronics, smartphones, TVs, and appliances.",
    isActive: true,
  },
  {
    name: "Sony",
    slug: "sony",
    description: "Entertainment and consumer electronics technology.",
    isActive: true,
  },
  {
    name: "Dell",
    slug: "dell",
    description: "Computers, laptops, monitors, and technology solutions.",
    isActive: true,
  },
  {
    name: "HP",
    slug: "hp",
    description: "Laptops, desktops, printers, and technology products.",
    isActive: true,
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    description: "Laptops, desktops, tablets, and computing devices.",
    isActive: true,
  },
  {
    name: "ASUS",
    slug: "asus",
    description: "Computers, gaming hardware, laptops, and accessories.",
    isActive: true,
  },
  {
    name: "Acer",
    slug: "acer",
    description: "Laptops, monitors, desktops, and computing products.",
    isActive: true,
  },
  {
    name: "LG",
    slug: "lg",
    description: "TVs, home appliances, monitors, and consumer electronics.",
    isActive: true,
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    description: "Computing, gaming, software, and consumer technology.",
    isActive: true,
  },
  {
    name: "Canon",
    slug: "canon",
    description: "Cameras, lenses, printers, and imaging technology.",
    isActive: true,
  },
  {
    name: "Nikon",
    slug: "nikon",
    description: "Cameras, lenses, and imaging products.",
    isActive: true,
  },
  {
    name: "Bose",
    slug: "bose",
    description: "Premium audio products and sound technology.",
    isActive: true,
  },
  {
    name: "JBL",
    slug: "jbl",
    description: "Speakers, headphones, and portable audio products.",
    isActive: true,
  },
  {
    name: "Anker",
    slug: "anker",
    description: "Chargers, power banks, cables, and electronics accessories.",
    isActive: true,
  },
] as const;