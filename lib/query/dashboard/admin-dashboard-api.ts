import { apiClient } from "@/lib/api/client";
import { AdminDashboardResponse, DashboardRange } from "./admin-dashboard-types";


export async function getAdminDashboard(
  range: DashboardRange,
) {
  return apiClient<AdminDashboardResponse>(
    `/api/admin/dashboard?range=${range}`,
  );
}