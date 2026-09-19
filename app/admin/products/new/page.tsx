import { AddProductForm } from "@/components/admin/products/add-products/add-product-form";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AddProductForm />
      </div>
    </div>
  );
}