"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHANNEL_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Currency } from "@/components/providers/DashboardContext";

interface RevenuePoint {
  date: string;
  noon: number;
  amazon: number;
  shopify: number;
}

function groupBy(data: RevenuePoint[], mode: "daily" | "weekly" | "monthly"): RevenuePoint[] {
  if (mode === "daily") return data;

  const buckets = new Map<string, RevenuePoint>();
  for (const point of data) {
    const date = new Date(point.date);
    let key: string;
    if (mode === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().slice(0, 10);
    } else {
      key = point.date.slice(0, 7);
    }
    const existing = buckets.get(key) ?? { date: key, noon: 0, amazon: 0, shopify: 0 };
    existing.noon += point.noon;
    existing.amazon += point.amazon;
    existing.shopify += point.shopify;
    buckets.set(key, existing);
  }
  return Array.from(buckets.values());
}

export function RevenueChart({ data, currency }: { data: RevenuePoint[]; currency: Currency }) {
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const grouped = useMemo(() => groupBy(data, mode), [data, mode]);
  const { t } = useLocale();

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t("dashboard.revenueByChannel")}</CardTitle>
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList>
            <TabsTrigger value="daily">{t("dashboard.daily")}</TabsTrigger>
            <TabsTrigger value="weekly">{t("dashboard.weekly")}</TabsTrigger>
            <TabsTrigger value="monthly">{t("dashboard.monthly")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={grouped} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                {(["noon", "amazon", "shopify"] as const).map((ch) => (
                  <linearGradient key={ch} id={`fill-${ch}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHANNEL_COLORS[ch]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHANNEL_COLORS[ch]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="noon" name="Noon" stroke={CHANNEL_COLORS.noon} fill="url(#fill-noon)" strokeWidth={2} />
              <Area type="monotone" dataKey="amazon" name="Amazon" stroke={CHANNEL_COLORS.amazon} fill="url(#fill-amazon)" strokeWidth={2} />
              <Area type="monotone" dataKey="shopify" name="Shopify" stroke={CHANNEL_COLORS.shopify} fill="url(#fill-shopify)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
