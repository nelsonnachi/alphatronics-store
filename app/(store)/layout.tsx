import { StoreHeader } from "../../components/storefront/header/store-header";
import { StoreFooter } from "../../components/storefront/footer/store-footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHeader />

      <main>
        {children}
      </main>

      <StoreFooter />
    </>
  );
}