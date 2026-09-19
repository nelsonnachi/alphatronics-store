import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { requireAdmin } from "@/lib/APIs/auth";
import { ApiError } from "@/lib/APIs/api-errors";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Not signed in -> send to sign-in, then back to /admin afterwards
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  // Signed in -> must be admin / super_admin and not banned
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof ApiError) {
      // 403 (not admin, or suspended) and similar -> back to the storefront
      redirect("/");
    }
    throw error; // real failures (e.g. database down) still surface
  }

  return <AdminShell>{children}</AdminShell>;
}