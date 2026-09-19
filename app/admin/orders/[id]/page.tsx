import { AdminOrderDetailsPage } from "@/components/admin/orders/order-details-page";

type AdminOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderPage({
  params,
}: AdminOrderPageProps) {
  const { id } = await params;

  return (
    <AdminOrderDetailsPage
      id={id}
    />
  );
}