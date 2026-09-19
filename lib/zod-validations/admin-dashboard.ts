import { z } from "zod";

export const dashboardQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "90d"]).default("7d"),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;