"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/format";
import type { Currency } from "@/components/providers/DashboardContext";

interface ProductRow {
  product: { _id: string; nameEn: string; sku: string; category: string };
  unitsSold: number;
  revenue: number;
}

interface ProductsAnalytics {
  topSellers: ProductRow[];
  topByRevenue: ProductRow[];
  bottomSellers: ProductRow[];
  categoryRevenue: { category: string; revenue: number }[];
}

const CATEGORY_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#F5A623", "#96BF48", "#0EA5E9", "#A855F7", "#EC4899", "#14B8A6"];

export function ChannelPerformance({ period, currency }: { period: string; currency: Currency }) {
  const { data, isLoading, error } = useAnalytics<ProductsAnalytics>(period, "products");

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState title="Couldn't load product analytics" description={error ?? undefined} />;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Best Sellers (units)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSellers} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="product.nameEn" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="unitsSold" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topByRevenue} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <YAxis type="category" dataKey="product.nameEn" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bottom 10 Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bottomSellers} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="product.nameEn" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="unitsSold" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={40} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {data.categoryRevenue.map((c, i) => (
                    <Cell key={c.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
