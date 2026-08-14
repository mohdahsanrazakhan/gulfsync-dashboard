"use client";

import { Mail, Phone, MapPin, User, Package, CreditCard, Truck, RotateCcw, StickyNote, Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { PaymentMethodBadge } from "@/components/orders/PaymentMethodBadge";
import { DELIVERY_PARTNER_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Order } from "@/types";

function SectionCard({
  icon: Icon,
  title,
  tone = "default",
  children,
}: {
  icon: React.ElementType;
  title: string;
  tone?: "default" | "warning";
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        tone === "warning" ? "border-warning/30 bg-warning/5" : "border-border bg-muted/30"
      )}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className={cn("h-4 w-4", tone === "warning" ? "text-warning" : "text-secondary")} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{children}</span>
    </div>
  );
}

function CopyableTracking({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 font-mono text-xs font-medium transition-colors hover:bg-accent"
      title={label}
    >
      {value}
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}

export function OrderDetailModal({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  // Reset scroll to the top every time a (new) order is opened — otherwise
  // the scroll position from a previously viewed order can carry over since
  // the dialog's DOM node is reused rather than remounted.
  const orderId = order?._id;
  useEffect(() => {
    if (orderId) bodyRef.current?.scrollTo({ top: 0 });
  }, [orderId]);

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        initialFocus={false}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden p-0 sm:max-w-2xl"
      >
        {order && (
          <>
            {/* Header */}
            <DialogHeader className="shrink-0 gap-0 border-b bg-card px-5 py-4">
              <DialogTitle className="flex flex-wrap items-center gap-2.5 pe-6 text-lg font-semibold tracking-tight">
                {order.orderId}
                <ChannelBadge channel={order.channel} />
                <OrderStatusBadge status={order.status} />
              </DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("orders.detail.placed")} {formatDate(order.createdAt)}
              </p>
            </DialogHeader>

            <div ref={bodyRef} className="space-y-4 overflow-y-auto p-5">
              {/* Customer */}
              <SectionCard icon={User} title={t("orders.detail.customer")}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white">
                    {order.customer.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium leading-tight">{order.customer.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {order.customer.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {order.customer.phone}
                    </p>
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
                      <span>
                        {order.customer.address}, {order.customer.city}, {order.customer.country}
                      </span>
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Items */}
              <SectionCard icon={Package} title={`${t("orders.detail.items")} (${order.items.length})`}>
                <div className="divide-y divide-border/70">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0 text-sm">
                      <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{item.nameEn}</span>
                        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                          ×{item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">{formatCurrency(item.totalPrice, order.payment.currency)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Payment */}
              <SectionCard icon={CreditCard} title={t("orders.detail.payment")}>
                <Row label={t("orders.detail.subtotal")}>{formatCurrency(order.payment.subtotal, order.payment.currency)}</Row>
                <Row label={t("orders.detail.shipping")}>{formatCurrency(order.payment.shippingCost, order.payment.currency)}</Row>
                <Row label={t("orders.detail.vat")}>{formatCurrency(order.payment.vatAmount, order.payment.currency)}</Row>
                {order.payment.discount > 0 && (
                  <Row label={t("orders.detail.discount")}>-{formatCurrency(order.payment.discount, order.payment.currency)}</Row>
                )}
                <div className="my-2 flex items-center justify-between rounded-lg bg-card px-3 py-2 ring-1 ring-border">
                  <span className="text-sm font-semibold">{t("orders.detail.total")}</span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatCurrency(order.payment.totalAmount, order.payment.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-sm text-muted-foreground">{t("orders.detail.method")}</span>
                  <PaymentMethodBadge method={order.payment.method} />
                </div>
              </SectionCard>

              {/* Shipping */}
              <SectionCard icon={Truck} title={t("orders.detail.shippingSection")}>
                <Row label={t("orders.detail.partner")}>{DELIVERY_PARTNER_LABELS[order.shipping.partner]}</Row>
                <div className="flex items-center justify-between gap-4 py-1 text-sm">
                  <span className="text-muted-foreground">{t("orders.detail.tracking")}</span>
                  <CopyableTracking value={order.shipping.trackingNumber} label={t("orders.detail.tracking")} />
                </div>
                <Row label={t("orders.detail.status")}>{titleCase(order.shipping.status)}</Row>
                <Row label={t("orders.detail.estimatedDelivery")}>{formatDate(order.shipping.estimatedDelivery)}</Row>
                {order.shipping.actualDelivery && (
                  <Row label={t("orders.detail.actualDelivery")}>{formatDate(order.shipping.actualDelivery)}</Row>
                )}
              </SectionCard>

              {/* Return */}
              {order.return.isReturned && (
                <SectionCard icon={RotateCcw} title={t("orders.detail.returnSection")} tone="warning">
                  <Row label={t("orders.detail.reason")}>{order.return.returnReason ? titleCase(order.return.returnReason) : "-"}</Row>
                  <Row label={t("orders.detail.refundStatus")}>
                    {order.return.refundStatus ? titleCase(order.return.refundStatus) : "-"}
                  </Row>
                  {order.return.refundAmount != null && (
                    <Row label={t("orders.detail.refundAmount")}>
                      {formatCurrency(order.return.refundAmount, order.payment.currency)}
                    </Row>
                  )}
                </SectionCard>
              )}

              {/* Notes */}
              {order.notes && (
                <SectionCard icon={StickyNote} title={t("orders.detail.notes")}>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.notes}</p>
                </SectionCard>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
