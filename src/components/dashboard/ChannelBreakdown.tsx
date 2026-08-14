"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHANNEL_COLORS, CHANNEL_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Currency } from "@/components/providers/DashboardContext";

export function ChannelBreakdown({
  revenueByChannel,
  currency,
}: {
  revenueByChannel: { noon: number; amazon: number; shopify: number };
  currency: Currency;
}) {
  const { t } = useLocale();
  const total = revenueByChannel.noon + revenueByChannel.amazon + revenueByChannel.shopify;
  const data = (["noon", "amazon", "shopify"] as const).map((ch) => ({
    name: CHANNEL_LABELS[ch],
    value: revenueByChannel[ch],
    color: CHANNEL_COLORS[ch],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("dashboard.revenueByChannel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="85%" paddingAngle={2}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Constrained to roughly the donut's hole diameter so long currency
              values wrap/shrink instead of overlapping the ring. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-1">
            <div className="flex w-[45%] min-w-[92px] flex-col items-center text-center">
              <span className="text-xs text-muted-foreground">{t("common.total")}</span>
              <span className="text-sm font-semibold leading-tight tabular-nums break-words sm:text-base">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name} · {total === 0 ? 0 : Math.round((d.value / total) * 100)}%
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
