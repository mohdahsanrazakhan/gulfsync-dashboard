"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DELIVERY_PARTNER_LABELS } from "@/lib/constants";
import type { DeliveryPartner } from "@/types";

interface DeliveryAnalytics {
  successRateByPartner: { partner: DeliveryPartner; rate: number }[];
  avgDeliveryTimeByPartner: { partner: DeliveryPartner; days: number }[];
  failedAttemptsByPartner: { partner: DeliveryPartner; failed: number }[];
  performanceByCityPartner: { city: string; partner: DeliveryPartner; total: number; rate: number }[];
}

export function DeliveryPartnerStats({ period }: { period: string }) {
  const { data, isLoading, error } = useAnalytics<DeliveryAnalytics>(period, "delivery");

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState title="Couldn't load delivery analytics" description={error ?? undefined} />;

  const label = (p: DeliveryPartner) => DELIVERY_PARTNER_LABELS[p];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.successRateByPartner.map((d) => ({ ...d, label: label(d.partner) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="rate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Delivery Time (days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.avgDeliveryTimeByPartner.map((d) => ({ ...d, label: label(d.partner) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="days" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failed Delivery Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.failedAttemptsByPartner.map((d) => ({ ...d, label: label(d.partner) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance by City × Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80">
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.performanceByCityPartner.map((row) => (
                  <TableRow key={`${row.city}-${row.partner}`}>
                    <TableCell>{row.city}</TableCell>
                    <TableCell>{label(row.partner)}</TableCell>
                    <TableCell className="tabular-nums">{row.total}</TableCell>
                    <TableCell className="tabular-nums">{row.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
