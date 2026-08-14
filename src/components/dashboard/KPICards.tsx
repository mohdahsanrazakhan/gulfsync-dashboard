"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Info, Package, RotateCcw, ShoppingCart, Wallet } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { DashboardStats } from "@/types";
import type { Currency } from "@/components/providers/DashboardContext";

function TrendPill({ changePercent, hint }: { changePercent: number; hint: string }) {
  const isUp = changePercent >= 0;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
          isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}
      >
        {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {formatPercent(Math.abs(changePercent))}
      </span>
      <span className="text-muted-foreground">{hint}</span>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const points = data.map((v, i) => ({ i, v }));
  const gradientId = `spark-${color.replace("#", "")}`;
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 1, bottom: 1, left: 1 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function rateColor(value: number, good: number, warn: number, higherIsBetter: boolean) {
  if (higherIsBetter) {
    if (value > good) return "text-success";
    if (value >= warn) return "text-warning";
    return "text-destructive";
  }
  if (value < good) return "text-success";
  if (value <= warn) return "text-warning";
  return "text-destructive";
}

interface KPICardData {
  label: string;
  value: string;
  valueClassName?: string;
  changePercent: number;
  sparkline?: number[];
  color: string;
  icon: LucideIcon;
  tooltip?: string;
}

function IconBadge({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${color}17`, color }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

function KPICard({ card, hint }: { card: KPICardData; hint: string }) {
  return (
    <Card className="gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <IconBadge icon={card.icon} color={card.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm text-muted-foreground">{card.label}</p>
            {card.tooltip && (
              <Tooltip>
                <TooltipTrigger className="inline-flex shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground/60 hover:text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{card.tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums", card.valueClassName)}>{card.value}</p>
        </div>
      </div>
      <TrendPill changePercent={card.changePercent} hint={hint} />
      {card.sparkline && <Sparkline data={card.sparkline} color={card.color} />}
    </Card>
  );
}

export function KPICards({ stats, currency }: { stats: DashboardStats; currency: Currency }) {
  const { t } = useLocale();
  const hint = t("dashboard.vsLastPeriod");

  const cards: KPICardData[] = [
    {
      label: t("dashboard.totalRevenue"),
      value: formatCurrency(stats.revenue.current, currency),
      changePercent: stats.revenue.changePercent,
      sparkline: stats.revenue.sparkline,
      color: "#6366F1",
      icon: Wallet,
      tooltip: t("dashboard.totalRevenueTooltip"),
    },
    {
      label: t("dashboard.totalOrders"),
      value: formatNumber(stats.orders.current),
      changePercent: stats.orders.changePercent,
      sparkline: stats.orders.sparkline,
      color: "#0F172A",
      icon: ShoppingCart,
      tooltip: t("dashboard.totalOrdersTooltip"),
    },
    {
      label: t("dashboard.codCollectionRate"),
      value: formatPercent(stats.codRate.current),
      valueClassName: rateColor(stats.codRate.current, 70, 50, true),
      changePercent: stats.codRate.changePercent,
      color: "#F5A623",
      icon: Package,
      tooltip: t("dashboard.codCollectionRateTooltip"),
    },
    {
      label: t("dashboard.returnRate"),
      value: formatPercent(stats.returnRate.current),
      valueClassName: rateColor(stats.returnRate.current, 10, 20, false),
      changePercent: -stats.returnRate.changePercent,
      color: "#10B981",
      icon: RotateCcw,
      tooltip: t("dashboard.returnRateTooltip"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KPICard key={card.label} card={card} hint={hint} />
      ))}
    </div>
  );
}
