"use client";

import { AlertCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Insight } from "@/types";

const SEVERITY_META = {
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  info: { icon: Info, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  opportunity: { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
} as const;

const SEVERITY_LABELS: Record<"en" | "ar", Record<keyof typeof SEVERITY_META, string>> = {
  en: { critical: "Critical", warning: "Warning", info: "Info", opportunity: "Opportunity" },
  ar: { critical: "حرج", warning: "تحذير", info: "معلومة", opportunity: "فرصة" },
};

export function InsightCard({ insight, onMarkRead }: { insight: Insight; onMarkRead: (id: string) => void }) {
  const { locale, t } = useLocale();
  const meta = SEVERITY_META[insight.severity];
  const Icon = meta.icon;
  const severityLabel = SEVERITY_LABELS[locale][insight.severity];

  return (
    <Card className={cn("relative overflow-hidden", !insight.isRead && "ring-1 ring-secondary/40")}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", meta.bg)}>
            <Icon className={cn("h-4.5 w-4.5", meta.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold uppercase tracking-wide", meta.color)}>{severityLabel}</span>
              {!insight.isRead && <span className="h-1.5 w-1.5 rounded-full bg-secondary" />}
            </div>
            <h3 className="mt-0.5 font-semibold leading-snug">{insight.title}</h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{insight.description}</p>

        <div className={cn("rounded-md border px-3 py-2 text-sm font-semibold", meta.border, meta.bg, meta.color)}>
          {insight.metric}
        </div>

        <p className="text-sm">
          <span className="font-medium">{t("aiInsights.recommendation")}: </span>
          {insight.recommendation}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(insight.createdAt)}</span>
          {!insight.isRead && (
            <Button size="sm" variant="outline" onClick={() => onMarkRead(insight._id)}>
              {t("aiInsights.markAsRead")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
