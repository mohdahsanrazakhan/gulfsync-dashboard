"use client";

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useOrders, type OrdersFilters } from "@/hooks/useOrders";
import { useLocale } from "@/components/providers/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { Pagination } from "@/components/shared/Pagination";
import type { Order } from "@/types";

const INITIAL_FILTERS: Partial<OrdersFilters> = {
  page: 1,
  limit: 25,
  channel: "all",
  status: "all",
  payment: "all",
  city: "all",
  partner: "all",
  search: "",
  sort: "createdAt",
  order: "desc",
};

export default function OrdersPage() {
  usePageTitle("pageTitles.orders");
  const { t } = useLocale();
  const [filters, setFilters] = useState<Partial<OrdersFilters>>(INITIAL_FILTERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data, isLoading, error } = useOrders(filters);

  return (
    <div className="space-y-4">
      <OrderFilters filters={filters} onChange={setFilters} />

      {isLoading && <LoadingSpinner label={t("common.loading")} />}
      {error && !isLoading && <EmptyState title={t("common.noResults")} description={error} />}

      {data && !isLoading && (
        <>
          <OrdersTable orders={data.orders} onSelect={setSelectedOrder} />

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            itemLabel={t("nav.orders").toLowerCase()}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onLimitChange={(limit) => setFilters((f) => ({ ...f, limit, page: 1 }))}
          />
        </>
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
