"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { titleCase } from "@/lib/format";
import type { Currency } from "@/components/providers/DashboardContext";

interface PaymentAnalytics {
  paymentDistribution: { method: string; count: number; amount: number }[];
  codVsPrepaidTrend: { month: string; cod: number; prepaid: number }[];
  codByCity: { city: string; rate: number; total: number }[];
  codRejectionReasons: { reason: string; count: number }[];
}

const PIE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#F5A623", "#96BF48", "#0F172A"];

function rateColor(rate: number) {
  if (rate >= 70) return "#10B981";
  if (rate >= 50) return "#F59E0B";
  return "#EF4444";
}

export function CODvsOnlineChart({ period }: { period: string; currency: Currency }) {
  const { data, isLoading, error } = useAnalytics<PaymentAnalytics>(period, "payment");

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState title="Couldn't load payment analytics" description={error ?? undefined} />;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.paymentDistribution} dataKey="count" nameKey="method" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {data.paymentDistribution.map((d, i) => (
                    <Cell key={d.method} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [`${v} orders`, titleCase(String(p.payload.method))]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">COD vs Prepaid Trend (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.codVsPrepaidTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="cod" name="COD" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prepaid" name="Prepaid" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">COD Collection Rate by City</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.codByCity} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={14}>
                  {data.codByCity.map((c) => (
                    <Cell key={c.city} fill={rateColor(c.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">COD Rejection Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          {data.codRejectionReasons.length === 0 ? (
            <EmptyState title="No COD rejections in this period" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.codRejectionReasons} dataKey="count" nameKey="reason" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.codRejectionReasons.map((d, i) => (
                      <Cell key={d.reason} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, _n, p) => [`${v} orders`, titleCase(String(p.payload.reason))]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
