import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { brands } from "../../../data/brands";

export function ShopByBrand() {
  const activeBrands = brands
    .filter((brand) => brand.isActive)
    .slice(0, 6);

  return (
    <section className="bg-[#F8FAFC] py-8 sm:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
              Shop By Brand
            </h2>

            <p className="mt-1 text-xs text-[#64748B]">
              Trusted brands. Genuine products.
            </p>
          </div>

          <Link
            href="/brands"
            className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] sm:text-xs"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {activeBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex h-20 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 transition-all hover:border-[#2563EB] hover:shadow-sm sm:h-24"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  width={100}
                  height={45}
                  className="max-h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
                />
              ) : (
                <span className="text-sm font-bold text-[#0B1F3B]">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}



// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

// import { useBrands } from "@/lib/query/brands/brand-hooks";

// export function ShopByBrand() {
//   const { data, isLoading, isError } = useBrands();

//   const activeBrands =
//     data?.data
//       ?.filter((brand) => brand.isActive)
//       .slice(0, 6) ?? [];

//   if (isLoading) {
//     return (
//       <section className="bg-[#F8FAFC] py-8 sm:py-10">
//         <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
//           <div className="mb-4 flex items-center justify-between">
//             <div>
//               <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

//               <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-200" />
//             </div>

//             <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />
//           </div>

//           <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
//             {Array.from({ length: 6 }).map(
//               (_, index) => (
//                 <div
//                   key={index}
//                   className="h-20 animate-pulse rounded-lg border border-[#E2E8F0] bg-white sm:h-24"
//                 />
//               ),
//             )}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (isError) {
//     return (
//       <section className="bg-[#F8FAFC] py-8 sm:py-10">
//         <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
//           <div className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-8 text-center">
//             <p className="text-xs text-[#64748B]">
//               Unable to load brands.
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-[#F8FAFC] py-8 sm:py-10">
//       <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
//         {/* Header */}

//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
//               Shop By Brand
//             </h2>

//             <p className="mt-1 text-xs text-[#64748B]">
//               Trusted brands. Genuine products.
//             </p>
//           </div>

//           <Link
//             href="/brands"
//             className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] sm:text-xs"
//           >
//             View All

//             <ArrowRight className="h-3 w-3" />
//           </Link>
//         </div>

//         {/* Brands */}

//         <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
//           {activeBrands.map((brand) => (
//             <Link
//               key={brand.id}
//               href={`/shop?brand=${brand.slug}`}
//               className="flex h-20 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 transition-all hover:border-[#2563EB] hover:shadow-sm sm:h-24"
//             >
//               {brand.logoUrl ? (
//                 <Image
//                   src={brand.logoUrl}
//                   alt={`${brand.name} logo`}
//                   width={100}
//                   height={45}
//                   className="max-h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
//                 />
//               ) : (
//                 <span className="text-sm font-bold text-[#0B1F3B]">
//                   {brand.name}
//                 </span>
//               )}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }