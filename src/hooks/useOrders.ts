"use client";

import { useFetch } from "@/hooks/useFetch";
import type { Order, Pagination } from "@/types";

export interface OrdersFilters {
  page: number;
  limit: number;
  channel: string;
  status: string;
  payment: string;
  city: string;
  partner: string;
  search: string;
  startDate: string;
  endDate: string;
  sort: string;
  order: string;
}

export function ordersQueryString(filters: Partial<OrdersFilters>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function useOrders(filters: Partial<OrdersFilters>) {
  const qs = ordersQueryString(filters);
  return useFetch<{ orders: Order[]; pagination: Pagination }>(`/api/orders?${qs}`);
}
