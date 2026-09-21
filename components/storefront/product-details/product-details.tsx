import Link from "next/link";

import type { ProductDetails as ProductDetailsType } from "@/lib/query/products/product-types";


import { CustomerService } from "../customer-service/customer-service";

import { ProductGallery } from "./product-gallery";
import { ProductInformation } from "./product-information";
import { ProductSpecifications } from "./product-specifications";
import { RelatedProducts } from "@/components/shop/related-products";

type ProductDetailsProps = {
  product: ProductDetailsType;
};

export function ProductDetails({
  product,
}: ProductDetailsProps) {
  return (
    <main className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 sm:py-8">

        {/* BREADCRUMB */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
          <Link
            href="/"
            className="transition-colors hover:text-[#2563EB]"
          >
            Home
          </Link>

          <span>/</span>

          {product.category && (
            <>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="transition-colors hover:text-[#2563EB]"
              >
                {product.category.name}
              </Link>

              <span>/</span>
            </>
          )}

          <span className="font-medium text-[#0F172A]">
            {product.name}
          </span>
        </div>

        {/* MAIN PRODUCT AREA */}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          <ProductInformation product={product} />
        </div>

        {/* LOWER INFORMATION */}

        <div className="mt-10 space-y-8 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-8">

          {/* PRODUCT DESCRIPTION */}

          <section>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Product Description
            </h2>

            {product.description ? (
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[#64748B]">
                {product.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-[#64748B]">
                No product description is available.
              </p>
            )}
          </section>

          {/* PRODUCT SPECIFICATIONS */}

          <ProductSpecifications
            specifications={product.specifications}
          />
        </div>

        {/* RELATED PRODUCTS */}

        <RelatedProducts slug={product.slug} />
      </div>

      {/* CUSTOMER SERVICE */}

      <CustomerService />
    </main>
  );
}