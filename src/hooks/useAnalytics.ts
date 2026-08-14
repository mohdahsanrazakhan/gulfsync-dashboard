"use client";

import { useFetch } from "@/hooks/useFetch";

export type AnalyticsType = "revenue" | "payment" | "returns" | "delivery" | "products";

export function useAnalytics<T>(period: string, type: AnalyticsType) {
  return useFetch<T>(`/api/analytics?period=${period}&type=${type}`);
}
