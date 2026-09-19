import { DashboardRange } from "./admin-dashboard-types";

export const dashboardKeys = {
  all: ["admin", "dashboard"] as const,

  detail: (range: DashboardRange) =>
    [...dashboardKeys.all, range] as const,
};