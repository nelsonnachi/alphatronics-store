import { CustomerDetailsPage } from "@/components/admin/customers/customer-details-page";

type CustomerDetailsRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailsRoute({
  params,
}: CustomerDetailsRouteProps) {
  const { id } = await params;

  return (
    <CustomerDetailsPage id={id} />
  );
}