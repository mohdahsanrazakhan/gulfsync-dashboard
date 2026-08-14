"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/shared/DataTable";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { PaymentMethodBadge } from "@/components/orders/PaymentMethodBadge";
import { DELIVERY_PARTNER_LABELS } from "@/lib/constants";
import { formatCurrency, formatRelativeTime, formatDate, titleCase } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Order } from "@/types";

export function OrdersTable({ orders, onSelect }: { orders: Order[]; onSelect: (order: Order) => void }) {
  const { t } = useLocale();

  if (orders.length === 0) {
    return <EmptyState title={t("orders.noMatch")} description={t("orders.noMatchHint")} />;
  }

  return (
    <DataTable
      headers={[
        t("orders.orderId"),
        t("common.channel"),
        t("orders.customer"),
        t("orders.items"),
        t("orders.amount"),
        t("orders.payment"),
        t("common.status"),
        t("orders.delivery"),
        t("orders.date"),
      ]}
    >
      {orders.map((order) => (
        <TableRow key={order._id} className="cursor-pointer" onClick={() => onSelect(order)}>
          <TableCell className="font-medium text-secondary">{order.orderId}</TableCell>
          <TableCell>
            <ChannelBadge channel={order.channel} />
          </TableCell>
          <TableCell>
            <div className="max-w-[160px]">
              <p className="truncate font-medium">{order.customer.name}</p>
              <p className="truncate text-xs text-muted-foreground">{order.customer.city}</p>
            </div>
          </TableCell>
          <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
            {order.items.length} · {order.items[0]?.nameEn}
          </TableCell>
          <TableCell className="tabular-nums">{formatCurrency(order.payment.totalAmount, order.payment.currency)}</TableCell>
          <TableCell>
            <PaymentMethodBadge method={order.payment.method} />
          </TableCell>
          <TableCell>
            <OrderStatusBadge status={order.status} />
          </TableCell>
          <TableCell className="text-sm">
            <p>{DELIVERY_PARTNER_LABELS[order.shipping.partner]}</p>
            <p className="text-xs text-muted-foreground">{titleCase(order.shipping.status)}</p>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground" title={formatDate(order.createdAt)}>
            {formatRelativeTime(order.createdAt)}
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  );
}
