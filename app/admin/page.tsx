import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <main className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#0f172a]">
          Dashboard
        </h1>

        <p className="mt-1 text-[13px] text-[#8993a4]">
          Welcome back. Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Dashboard */}
      <AdminDashboard />
    </main>
  );
}