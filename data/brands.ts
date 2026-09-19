export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
};

export const brands: Brand[] = [
  {
    id: "brand-apple",
    name: "Apple",
    slug: "apple",
    logoUrl: "/images/brands/apple.jpg",
    description: "Innovative consumer electronics and technology.",
    website: "https://www.apple.com",
    isActive: true,
  },
  {
    id: "brand-samsung",
    name: "Samsung",
    slug: "samsung",
    logoUrl: "/images/brands/samsung.jpg",
    description: "Global technology and consumer electronics.",
    website: "https://www.samsung.com",
    isActive: true,
  },
  {
    id: "brand-lg",
    name: "LG",
    slug: "lg",
    logoUrl: "/images/brands/lg.jpg",
    description: "Consumer electronics and home appliances.",
    website: "https://www.lg.com",
    isActive: true,
  },
  {
    id: "brand-sony",
    name: "Sony",
    slug: "sony",
    logoUrl: "/images/brands/sony.jpg",
    description: "Consumer electronics and entertainment technology.",
    website: "https://www.sony.com",
    isActive: true,
  },
  {
    id: "brand-hisense",
    name: "Hisense",
    slug: "hisense",
    logoUrl: "/images/brands/hisense.jpg",
    description: "Consumer electronics and home appliances.",
    website: "https://global.hisense.com",
    isActive: true,
  },
  {
    id: "brand-bosch",
    name: "Bosch",
    slug: "bosch",
    logoUrl: "/images/brands/bosch.jpg",
    description: "Home appliances and engineering technology.",
    website: "https://www.bosch.com",
    isActive: true,
  },
];






// 1. QueryClient                 ✅ DONE
// 2. QueryProvider               ✅ DONE
// 3. apiClient                   ✅ DONE
// 4. Product types               ✅ DONE
// 5. Product API functions       ✅ DONE
// 6. Product query keys          ✅ DONE
// 7. Public product hooks        ✅ DONE
// 8. Admin product hooks         ✅ DONE
// 9. Connect hooks to UI         ← NEXT
// 10. Understand loading/error states
// 11. Test caching
// 12. Test filters/pagination
// 13. Test mutations
// 14. Handle cache invalidation properly