import { Skeleton } from "@/components/ui/skeleton";

type ProductSectionSkeletonProps = {
  variant?: "featured" | "new-arrivals";
};

export function ProductSectionSkeleton({
  variant = "featured",
}: ProductSectionSkeletonProps) {
  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* HEADER */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />

            <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
          </div>

          <Skeleton className="h-4 w-14 sm:w-16" />
        </div>

        {/* PRODUCT GRID */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      {/* PRODUCT IMAGE */}

      <Skeleton className="aspect-square w-full rounded-none" />

      {/* PRODUCT DETAILS */}

      <div className="space-y-3 p-3">
        {/* PRODUCT NAME */}

        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* PRICE */}

        <Skeleton className="h-4 w-24" />

        {/* RATING / STOCK */}

        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* BUTTON */}

        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}