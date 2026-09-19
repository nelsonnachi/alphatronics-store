import type { ProductSpecification } from "@/lib/query/products/product-types";

type ProductSpecificationsProps = {
  specifications: ProductSpecification[];
};

export function ProductSpecifications({
  specifications,
}: ProductSpecificationsProps) {
  // ==========================================================
  // GROUP SPECIFICATIONS
  // ==========================================================

  const groups = new Map<
    string,
    ProductSpecification[]
  >();

  for (const specification of specifications) {
    const existing =
      groups.get(specification.group) ?? [];

    existing.push(specification);

    groups.set(
      specification.group,
      existing,
    );
  }

  // ==========================================================
  // NO SPECIFICATIONS
  // ==========================================================

  if (groups.size === 0) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="border-t border-[#E2E8F0] pt-8">
      <h2 className="text-xl font-bold text-[#0F172A]">
        Technical Specifications
      </h2>

      <div className="mt-6 space-y-6">
        {Array.from(groups.entries()).map(
          ([groupName, specs]) => {
            const sortedSpecs = [
              ...specs,
            ].sort(
              (a, b) =>
                a.position - b.position,
            );

            return (
              <div key={groupName}>
                <h3 className="mb-3 text-sm font-bold text-[#0B1F3B]">
                  {groupName}
                </h3>

                <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                  {sortedSpecs.map(
                    (specification) => (
                      <div
                        key={
                          specification.id
                        }
                        className="grid grid-cols-2 border-b border-[#E2E8F0] last:border-b-0"
                      >
                        <div className="bg-[#F8FAFC] px-4 py-3 text-xs font-medium text-[#64748B]">
                          {
                            specification.key
                          }
                        </div>

                        <div className="px-4 py-3 text-xs text-[#0F172A]">
                          {
                            specification.value
                          }
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}