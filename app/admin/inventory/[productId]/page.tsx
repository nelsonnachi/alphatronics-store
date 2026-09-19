import { InventoryProductPage } from "@/components/admin/inventory/single-inventory-page/inventory-product-page";


type AdminInventoryProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function AdminInventoryProductPage({
  params,
}: AdminInventoryProductPageProps) {
  const { productId } = await params;

  return (
    <InventoryProductPage productId={productId} />
  );
}