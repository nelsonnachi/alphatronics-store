import Link from "next/link";
import {
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Smartphone,
  Speaker,
  TabletSmartphone,
  Watch,
} from "lucide-react";

const categories = [
  {
    label: "Laptops & Computers",
    href: "/products?category=laptops-computers",
    icon: Laptop,
  },
  {
    label: "Smartphones & Tablets",
    href: "/products?category=smartphones-tablets",
    icon: Smartphone,
  },
  {
    label: "TV & Home Theater",
    href: "/products?category=tv-home-theater",
    icon: Monitor,
  },
  {
    label: "Audio & Headphones",
    href: "/products?category=audio-headphones",
    icon: Headphones,
  },
  {
    label: "Gaming",
    href: "/products?category=gaming",
    icon: Gamepad2,
  },
  {
    label: "Accessories",
    href: "/products?category=accessories",
    icon: Speaker,
  },
  {
    label: "Home Appliances",
    href: "/products?category=home-appliances",
    icon: TabletSmartphone,
  },
  {
    label: "Cameras & Photography",
    href: "/products?category=cameras-photography",
    icon: Camera,
  },
  {
    label: "Smart Wearables",
    href: "/products?category=smart-wearables",
    icon: Watch,
  },
  {
    label: "Office & Productivity",
    href: "/products?category=office-productivity",
    icon: BriefcaseBusiness,
  },
];

export function CategorySidebar() {
  return (
    <aside className="hidden w-60 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm lg:block">
      {/* Header */}
      <div className="flex h-7 items-center justify-between border-b border-slate-100 px-4">
        <span className="text-sm font-semibold text-slate-900">
          All Categories
        </span>

        <ChevronRight className="size-4 text-slate-500" />
      </div>

      {/* Categories */}
      <nav>
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.href}
              href={category.href}
              className="group flex h-9 items-center justify-between px-4 text-[11px] text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
            >
              {/* Category name and icon */}
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="size-4 shrink-0 text-slate-600 transition-colors group-hover:text-blue-600" />

                <span className="truncate">{category.label}</span>
              </span>

              {/* Arrow */}
              <ChevronRight className="size-3 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}







// "use client";

// import Link from "next/link";
// import {
//   BriefcaseBusiness,
//   Camera,
//   ChevronRight,
//   Gamepad2,
//   Headphones,
//   Laptop,
//   Monitor,
//   Package,
//   Smartphone,
//   Speaker,
//   TabletSmartphone,
//   Watch,
// } from "lucide-react";

// import { useCategories } from "@/lib/query/categories/category-hooks";

// import type { LucideIcon } from "lucide-react";

// // ============================================================
// // ICON MAP
// // ============================================================
// //
// // The database stores the icon name as a string:
// //
// // "Laptop"
// // "Smartphone"
// // "Gamepad2"
// // etc.
// //
// // This map converts that string into the actual Lucide icon.
// // ============================================================

// const categoryIcons: Record<string, LucideIcon> = {
//   Laptop,
//   Smartphone,
//   Monitor,
//   Headphones,
//   Gamepad2,
//   Speaker,
//   TabletSmartphone,
//   Camera,
//   Watch,
//   BriefcaseBusiness,
// };

// // ============================================================
// // CATEGORY SIDEBAR
// // ============================================================

// export function CategorySidebar() {
//   // ==========================================================
//   // GET CATEGORIES FROM API
//   // ==========================================================

//   const {
//     data,
//     isLoading,
//     isError,
//   } = useCategories();

//   // ==========================================================
//   // API RETURNS:
//   //
//   // {
//   //   success: true,
//   //   data: [...]
//   // }
//   //
//   // So we get the categories from data?.data
//   // ==========================================================

//   const categories = data?.data ?? [];

//   // ==========================================================
//   // LOADING STATE
//   // ==========================================================

//   if (isLoading) {
//     return (
//       <aside className="hidden w-60 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm lg:block">
//         <div className="flex h-7 items-center border-b border-slate-100 px-4">
//           <span className="text-sm font-semibold text-slate-900">
//             All Categories
//           </span>
//         </div>

//         <div className="space-y-1 p-2">
//           {Array.from({ length: 10 }).map((_, index) => (
//             <div
//               key={index}
//               className="h-9 animate-pulse rounded bg-slate-100"
//             />
//           ))}
//         </div>
//       </aside>
//     );
//   }

//   // ==========================================================
//   // ERROR STATE
//   // ==========================================================

//   if (isError) {
//     return (
//       <aside className="hidden w-60 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm lg:block">
//         <div className="flex h-7 items-center border-b border-slate-100 px-4">
//           <span className="text-sm font-semibold text-slate-900">
//             All Categories
//           </span>
//         </div>

//         <div className="px-4 py-6">
//           <p className="text-xs text-slate-500">
//             Unable to load categories.
//           </p>
//         </div>
//       </aside>
//     );
//   }

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <aside className="hidden w-60 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm lg:block">
//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div className="flex h-7 items-center justify-between border-b border-slate-100 px-4">
//         <span className="text-sm font-semibold text-slate-900">
//           All Categories
//         </span>

//         <ChevronRight className="size-4 text-slate-500" />
//       </div>

//       {/* =====================================================
//           CATEGORIES
//       ===================================================== */}

//       <nav>
//         {categories.map((category) => {
//           // ==================================================
//           // GET ICON
//           // ==================================================
//           //
//           // category.icon comes from the database.
//           //
//           // Example:
//           //
//           // category.icon = "Laptop"
//           //
//           // categoryIcons["Laptop"] = Laptop
//           //
//           // If there is no matching icon, use Package.
//           // ==================================================

//           const Icon =
//             (category.icon
//               ? categoryIcons[category.icon]
//               : null) ?? Package;

//           return (
//             <Link
//               key={category.id}
//               href={`/shop?category=${category.slug}`}
//               className="group flex h-9 items-center justify-between px-4 text-[11px] text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
//             >
//               {/* =================================================
//                   CATEGORY NAME + ICON
//               ================================================= */}

//               <span className="flex min-w-0 items-center gap-3">
//                 <Icon className="size-4 shrink-0 text-slate-600 transition-colors group-hover:text-blue-600" />

//                 <span className="truncate">
//                   {category.name}
//                 </span>
//               </span>

//               {/* =================================================
//                   ARROW
//               ================================================= */}

//               <ChevronRight className="size-3 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }