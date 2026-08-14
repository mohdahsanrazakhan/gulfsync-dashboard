"use client";

import { Search, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CHANNELS,
  CHANNEL_LABELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_PARTNERS,
  DELIVERY_PARTNER_LABELS,
  CITIES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";
import type { OrdersFilters } from "@/hooks/useOrders";
import { ordersQueryString } from "@/hooks/useOrders";

const DEFAULT_FILTERS: Partial<OrdersFilters> = {
  page: 1,
  limit: 25,
  channel: "all",
  status: "all",
  payment: "all",
  city: "all",
  partner: "all",
  search: "",
  startDate: "",
  endDate: "",
};

/** Label + control wrapper so every filter is self-explanatory at a glance. */
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function OrderFilters({
  filters,
  onChange,
}: {
  filters: Partial<OrdersFilters>;
  onChange: (next: Partial<OrdersFilters>) => void;
}) {
  const { t } = useLocale();
  const update = (patch: Partial<OrdersFilters>) => onChange({ ...filters, ...patch, page: 1 });

  const activeCount = [
    filters.channel && filters.channel !== "all",
    filters.status && filters.status !== "all",
    filters.payment && filters.payment !== "all",
    filters.city && filters.city !== "all",
    filters.partner && filters.partner !== "all",
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      {/* Search + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("orders.searchPlaceholder")}
            maxLength={100}
            className="ps-8"
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 sm:ms-auto">
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
              <X className="me-1 h-3.5 w-3.5" /> {t("common.clearFilters")} ({activeCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            render={<a href={`/api/orders/export?${ordersQueryString(filters)}`} />}
            nativeButton={false}
          >
            <Download className="me-1 h-3.5 w-3.5" /> {t("common.exportCsv")}
          </Button>
        </div>
      </div>

      {/* Channel */}
      <FilterField label={t("common.channel")}>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => update({ channel: "all" })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              (filters.channel ?? "all") === "all"
                ? "border-secondary bg-secondary text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {t("common.all")}
          </button>
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => update({ channel: ch })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filters.channel === ch
                  ? "border-secondary bg-secondary text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {CHANNEL_LABELS[ch]}
            </button>
          ))}
        </div>
      </FilterField>

      {/* Structured filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterField label={t("common.status")}>
          <Select value={filters.status || "all"} onValueChange={(v) => update({ status: v ?? "all" })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => (v === "all" ? t("common.allStatuses") : t(`orderStatuses.${v}`))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`orderStatuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("common.paymentMethod")}>
          <Select value={filters.payment || "all"} onValueChange={(v) => update({ payment: v ?? "all" })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => (v === "all" ? t("common.allMethods") : t(`paymentMethods.${v}`))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allMethods")}</SelectItem>
              {PAYMENT_METHODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`paymentMethods.${p}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("common.city")}>
          <Select value={filters.city || "all"} onValueChange={(v) => update({ city: v ?? "all" })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => (v === "all" ? t("common.allCities") : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allCities")}</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("common.courier")}>
          <Select value={filters.partner || "all"} onValueChange={(v) => update({ partner: v ?? "all" })}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) =>
                  v === "all" ? t("common.allCouriers") : DELIVERY_PARTNER_LABELS[v as keyof typeof DELIVERY_PARTNER_LABELS]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allCouriers")}</SelectItem>
              {DELIVERY_PARTNERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {DELIVERY_PARTNER_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("common.orderDate")}>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              aria-label="Start date"
              className="w-full"
              value={filters.startDate ?? ""}
              onChange={(e) => update({ startDate: e.target.value })}
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label="End date"
              className="w-full"
              value={filters.endDate ?? ""}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </div>
        </FilterField>
      </div>
    </div>
  );
}
