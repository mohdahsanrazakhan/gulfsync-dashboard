"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/shared/DataTable";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { PaymentMethodBadge } from "@/components/orders/PaymentMethodBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Order } from "@/types";

export function RecentOrders({ orders }: { orders: Order[] }) {
  const { t } = useLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t("dashboard.recentOrders")}</CardTitle>
        <Button variant="link" render={<Link href="/orders" />} nativeButton={false} className="h-auto p-0">
          {t("common.viewAll")}
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState title={t("dashboard.noOrdersYet")} description={t("dashboard.noOrdersYetHint")} />
        ) : (
          <DataTable
            headers={[
              t("orders.orderId"),
              t("common.channel"),
              t("orders.customer"),
              t("orders.amount"),
              t("common.status"),
              t("orders.payment"),
            ]}
          >
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.orderId}</TableCell>
                <TableCell>
                  <ChannelBadge channel={order.channel} />
                </TableCell>
                <TableCell className="max-w-[140px] truncate">{order.customer.name}</TableCell>
                <TableCell className="tabular-nums">{formatCurrency(order.payment.totalAmount, order.payment.currency)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <PaymentMethodBadge method={order.payment.method} />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </CardContent>
    </Card>
  );
}
