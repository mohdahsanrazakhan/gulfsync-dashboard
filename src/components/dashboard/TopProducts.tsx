"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { DashboardStats } from "@/types";
import type { Currency } from "@/components/providers/DashboardContext";

export function TopProducts({
  topProducts,
  currency,
}: {
  topProducts: DashboardStats["topProducts"];
  currency: Currency;
}) {
  const { t } = useLocale();
  const maxUnits = Math.max(1, ...topProducts.map((p) => p.unitsSold));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("dashboard.topProducts")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.length === 0 ? (
          <EmptyState title={t("dashboard.noSalesYet")} description={t("dashboard.noSalesYetHint")} />
        ) : (
          topProducts.map((entry) => (
            <div key={entry.product._id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{entry.product.nameEn}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatNumber(entry.unitsSold)} · {formatCurrency(entry.revenue, currency)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${(entry.unitsSold / maxUnits) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
