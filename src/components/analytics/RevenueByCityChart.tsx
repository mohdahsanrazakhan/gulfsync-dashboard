"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { CHANNEL_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Currency } from "@/components/providers/DashboardContext";

interface RevenueAnalytics {
  revenueByChannelOverTime: { month: string; noon: number; amazon: number; shopify: number }[];
  revenueByCity: { city: string; revenue: number }[];
}

export function RevenueByCityChart({ period, currency }: { period: string; currency: Currency }) {
  const { data, isLoading, error } = useAnalytics<RevenueAnalytics>(period, "revenue");

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState title="Couldn't load revenue analytics" description={error ?? undefined} />;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Channel (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueByChannelOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={50} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="noon" stackId="1" stroke={CHANNEL_COLORS.noon} fill={CHANNEL_COLORS.noon} fillOpacity={0.7} />
                <Area type="monotone" dataKey="amazon" stackId="1" stroke={CHANNEL_COLORS.amazon} fill={CHANNEL_COLORS.amazon} fillOpacity={0.7} />
                <Area type="monotone" dataKey="shopify" stackId="1" stroke={CHANNEL_COLORS.shopify} fill={CHANNEL_COLORS.shopify} fillOpacity={0.7} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by City (Top 8)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByCity} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
