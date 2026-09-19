import { notFound } from "next/navigation";

import { getProductBySlug } from "../../../../data/products";
import { ProductDetails } from "../../../../components/storefront/product-details/product-details";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}