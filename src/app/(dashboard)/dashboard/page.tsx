"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardContext } from "@/components/providers/DashboardContext";
import { useLocale } from "@/components/providers/LocaleContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { KPICards } from "@/components/dashboard/KPICards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ChannelBreakdown } from "@/components/dashboard/ChannelBreakdown";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { CODTracker } from "@/components/dashboard/CODTracker";
import { QuickAlerts } from "@/components/dashboard/QuickAlerts";

export default function DashboardPage() {
  usePageTitle("pageTitles.overview");
  const { period, currency } = useDashboardContext();
  const { t } = useLocale();
  const { data, isLoading, error } = useDashboardStats(period, currency);

  if (isLoading) return <LoadingSpinner label={t("common.loading")} />;
  if (error || !data) return <EmptyState title={t("common.noResults")} description={error ?? t("common.noResultsHint")} />;

  return (
    <div className="space-y-6">
      <KPICards stats={data} currency={currency} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueChart data={data.revenueByDay} currency={currency} />
        <ChannelBreakdown revenueByChannel={data.revenueByChannel} currency={currency} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentOrders orders={data.recentOrders} />
        <TopProducts topProducts={data.topProducts} currency={currency} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CODTracker codByCity={data.codByCity} />
        <QuickAlerts alerts={data.alerts} />
      </div>
    </div>
  );
}
