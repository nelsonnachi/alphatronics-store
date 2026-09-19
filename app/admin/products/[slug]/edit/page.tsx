import { EditProductForm } from "@/components/admin/products/edit-product/edit-product-form";

type EditProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <EditProductForm slug={slug} />
      </div>
    </div>
  );
}