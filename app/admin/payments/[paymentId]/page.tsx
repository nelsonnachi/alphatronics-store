import { AdminPaymentDetailPage } from "@/components/admin/payments/payment-details/admin-payment-detail-page";

type PaymentDetailPageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function PaymentDetailPage({
  params,
}: PaymentDetailPageProps) {
  const { paymentId } = await params;

  return <AdminPaymentDetailPage paymentId={paymentId} />;
}
