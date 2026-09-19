import Link from "next/link";

import type { ProductDetails as ProductDetailsType } from "@/lib/query/products/product-types";

import { RelatedProducts } from "@/components/shop/related-products";

import { ProductGallery } from "./product-gallery";
import { ProductInformation } from "./product-information";
import { ProductSpecifications } from "./product-specifications";
import { CustomerService } from "../customer-service/customer-service";

type ProductDetailsProps = {
  product: ProductDetailsType;
};

export function ProductDetails({
  product,
}: ProductDetailsProps) {
  return (
    <main className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 sm:py-8">
        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
          <Link href="/">
            Home
          </Link>

          <span>/</span>

          <Link
            href={`/shop?category=${product.category.slug}`}
          >
            {product.category.name}
          </Link>

          <span>/</span>

          <span className="font-medium text-[#0F172A]">
            {product.name}
          </span>
        </div>

        {/* ====================================================
            MAIN PRODUCT AREA
        ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          <ProductInformation
            product={product}
          />
        </div>

        {/* ====================================================
            LOWER INFORMATION
        ==================================================== */}

        <div className="mt-10 space-y-8 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-8">
          {/* PRODUCT DESCRIPTION */}

          <section>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Product Description
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-[#64748B]">
              {product.description}
            </p>
          </section>

          {/* PRODUCT SPECIFICATIONS */}

          <ProductSpecifications
            specifications={
              product.specifications
            }
          />
        </div>

        {/* ====================================================
            RELATED PRODUCTS
        ==================================================== */}

        <RelatedProducts
          slug={product.slug}
        />
      </div>

      {/* ====================================================
          CUSTOMER SERVICE
      ==================================================== */}

      <CustomerService />
    </main>
  );
}