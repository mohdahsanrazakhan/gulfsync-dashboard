"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInventory, type InventoryFilters } from "@/hooks/useInventory";
import { useLocale } from "@/components/providers/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { MismatchAlert } from "@/components/inventory/MismatchAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/shared/Pagination";
import { Search } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

/** Label + control wrapper so every filter is self-explanatory at a glance. */
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading inventory..." />}>
      <InventoryPageInner />
    </Suspense>
  );
}

function InventoryPageInner() {
  usePageTitle("pageTitles.inventory");
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Partial<InventoryFilters>>({
    status: searchParams.get("status") ?? "all",
    category: "all",
    search: "",
    page: 1,
    limit: 25,
  });
  const tableRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useInventory(filters);

  const STATUS_OPTIONS = [
    { value: "all", label: t("common.allStatuses") },
    { value: "in_stock", label: t("inventory.inStock") },
    { value: "low_stock", label: t("inventory.lowStock") },
    { value: "out_of_stock", label: t("inventory.outOfStock") },
    { value: "mismatch", label: t("inventory.mismatched") },
  ];
  const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

  return (
    <div className="space-y-4">
      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: t("inventory.totalSkus"), value: data.summary.total },
            { label: t("inventory.inStock"), value: data.summary.inStock },
            { label: t("inventory.lowStock"), value: data.summary.lowStock },
            { label: t("inventory.outOfStock"), value: data.summary.outOfStock },
            { label: t("inventory.mismatched"), value: data.summary.mismatched },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <MismatchAlert
          count={data.summary.mismatched}
          onJump={() => tableRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <FilterField label={t("common.search")}>
          <div className="relative w-full min-w-[200px] sm:w-64">
            <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("inventory.searchPlaceholder")}
              maxLength={100}
              className="ps-8"
              value={filters.search ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
        </FilterField>

        <FilterField label={t("common.status")}>
          <Select value={filters.status ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, status: v ?? "all", page: 1 }))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>{(v: string) => STATUS_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("common.category")}>
          <Select value={filters.category ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, category: v ?? "all", page: 1 }))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>{(v: string) => (v === "all" ? t("common.allCategories") : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allCategories")}</SelectItem>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      {isLoading && <LoadingSpinner label={t("common.loading")} />}
      {error && !isLoading && <EmptyState title={t("common.noResults")} description={error} />}

      {data && !isLoading && (
        <div ref={tableRef}>
          <InventoryTable items={data.items} />

          <Pagination
            className="mt-3"
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            itemLabel="SKUs"
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onLimitChange={(limit) => setFilters((f) => ({ ...f, limit, page: 1 }))}
          />
        </div>
      )}
    </div>
  );
}
