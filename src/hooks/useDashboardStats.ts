"use client";

import { useFetch } from "@/hooks/useFetch";
import type { DashboardStats } from "@/types";

export function useDashboardStats(period: string, currency: string) {
  return useFetch<DashboardStats>(`/api/dashboard/stats?period=${period}&currency=${currency}`);
}
