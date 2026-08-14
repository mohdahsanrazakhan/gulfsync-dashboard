"use client";

import { useFetch } from "@/hooks/useFetch";
import type { Inventory, Pagination, Product } from "@/types";

export interface InventoryFilters {
  status: string;
  category: string;
  search: string;
  page: number;
  limit: number;
}

export interface InventoryItem extends Inventory {
  product: Product;
}

export interface InventorySummary {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  mismatched: number;
}

export function useInventory(filters: Partial<InventoryFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  return useFetch<{ items: InventoryItem[]; summary: InventorySummary; pagination: Pagination }>(
    `/api/inventory?${params.toString()}`
  );
}
