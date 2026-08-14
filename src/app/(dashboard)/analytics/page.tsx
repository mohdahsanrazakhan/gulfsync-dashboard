"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useDashboardContext } from "@/components/providers/DashboardContext";
import { useLocale } from "@/components/providers/LocaleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueByCityChart } from "@/components/analytics/RevenueByCityChart";
import { CODvsOnlineChart } from "@/components/analytics/CODvsOnlineChart";
import { ReturnRateChart } from "@/components/analytics/ReturnRateChart";
import { DeliveryPartnerStats } from "@/components/analytics/DeliveryPartnerStats";
import { ChannelPerformance } from "@/components/analytics/ChannelPerformance";

export default function AnalyticsPage() {
  usePageTitle("pageTitles.analytics");
  const { period, currency } = useDashboardContext();
  const { t } = useLocale();

  return (
    <Tabs defaultValue="revenue" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="revenue">{t("analytics.revenue")}</TabsTrigger>
        <TabsTrigger value="payment">{t("analytics.payment")}</TabsTrigger>
        <TabsTrigger value="returns">{t("analytics.returns")}</TabsTrigger>
        <TabsTrigger value="delivery">{t("analytics.delivery")}</TabsTrigger>
        <TabsTrigger value="products">{t("analytics.products")}</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue">
        <RevenueByCityChart period={period} currency={currency} />
      </TabsContent>
      <TabsContent value="payment">
        <CODvsOnlineChart period={period} currency={currency} />
      </TabsContent>
      <TabsContent value="returns">
        <ReturnRateChart period={period} currency={currency} />
      </TabsContent>
      <TabsContent value="delivery">
        <DeliveryPartnerStats period={period} />
      </TabsContent>
      <TabsContent value="products">
        <ChannelPerformance period={period} currency={currency} />
      </TabsContent>
    </Tabs>
  );
}
