"use client";

import Link from "next/link";
import { AlertTriangle, PackageX, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/providers/LocaleContext";
import type { DashboardStats } from "@/types";

export function QuickAlerts({ alerts }: { alerts: DashboardStats["alerts"] }) {
  const { t } = useLocale();

  const items = [
    {
      href: "/inventory?status=low_stock",
      icon: PackageX,
      label: t("dashboard.lowStockProducts"),
      count: alerts.lowStock,
      color: "text-warning",
    },
    {
      href: "/inventory?status=mismatch",
      icon: AlertTriangle,
      label: t("dashboard.inventoryMismatches"),
      count: alerts.mismatches,
      color: "text-orange-600",
    },
    {
      href: "/ai-insights?filter=unread",
      icon: Sparkles,
      label: t("dashboard.unreadInsights"),
      count: alerts.unreadInsights,
      color: "text-secondary",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("dashboard.quickAlerts")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${item.color}`} />
                {item.label}
              </span>
              <span className="flex items-center gap-1 font-medium tabular-nums">
                {item.count}
                <ChevronRight className="h-4 w-4 rtl:rotate-180 text-muted-foreground" />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
