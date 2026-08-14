"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLocale } from "@/components/providers/LocaleContext";
import type { DashboardStats } from "@/types";

function rateColor(rate: number) {
  if (rate >= 70) return "#10B981";
  if (rate >= 50) return "#F59E0B";
  return "#EF4444";
}

export function CODTracker({ codByCity }: { codByCity: DashboardStats["codByCity"] }) {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("dashboard.codByCity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {codByCity.length === 0 ? (
          <EmptyState title={t("dashboard.noCodOrders")} description={t("dashboard.noCodOrdersHint")} />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={codByCity} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/60" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={16}>
                  {codByCity.map((c) => (
                    <Cell key={c.city} fill={rateColor(c.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
