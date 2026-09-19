import { useQuery } from "@tanstack/react-query";

import { DashboardRange } from "./admin-dashboard-types";
import { getAdminDashboard } from "./admin-dashboard-api";
import { dashboardKeys } from "./admin-dashboard-key";

export function useAdminDashboard(
  range: DashboardRange,
) {
  return useQuery({
    queryKey: dashboardKeys.detail(range),

    queryFn: () => getAdminDashboard(range),

    staleTime: 5 * 60 * 1000,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}