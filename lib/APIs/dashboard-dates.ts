import type { DashboardQuery } from "@/lib/zod-validations/admin-dashboard";

export function getDashboardDateBounds(
  range: DashboardQuery["range"],
) {
  const now = new Date();

  let start: Date;

  if (range === "today") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else {
    const days =
      range === "30d"
        ? 30
        : range === "90d"
          ? 90
          : 7;

    start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
  }

  // Length of the current dashboard period.
  const periodLengthMs =
    now.getTime() - start.getTime();

  // Previous period has the same duration.
  const previousStart = new Date(
    start.getTime() - periodLengthMs,
  );

  const previousEnd = start;

  return {
    start,
    end: now,
    previousStart,
    previousEnd,
  };
}

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}