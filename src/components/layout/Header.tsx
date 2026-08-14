"use client";

import Link from "next/link";
import { Bell, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDashboardContext, type Period, type Currency } from "@/components/providers/DashboardContext";
import { useLocale } from "@/components/providers/LocaleContext";
import { useFetch } from "@/hooks/useFetch";
import { MobileNavTrigger } from "@/components/layout/MobileNav";
import type { Insight } from "@/types";

const PERIOD_OPTIONS: { value: Period; key: string }[] = [
  { value: "7d", key: "header.period7d" },
  { value: "30d", key: "header.period30d" },
  { value: "90d", key: "header.period90d" },
  { value: "12m", key: "header.period12m" },
];

export function Header() {
  const { period, setPeriod, currency, setCurrency, pageTitle } = useDashboardContext();
  const { locale, setLocale, t } = useLocale();
  const { data } = useFetch<{ insights: Insight[] }>("/api/ai/insights?filter=unread");
  const unreadCount = data?.insights.length ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-card/95 px-4 backdrop-blur md:px-6">
      <MobileNavTrigger />
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight md:text-xl">{t(pageTitle)}</h1>

      <div className="hidden items-center gap-2 sm:flex">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue>{(v: Period) => t(PERIOD_OPTIONS.find((o) => o.value === v)?.key ?? "")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          <SelectTrigger className="h-9 w-[80px]">
            <SelectValue>{(v: Currency) => v}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAR">SAR</SelectItem>
            <SelectItem value="AED">AED</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          title={t("header.language")}
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        >
          <Languages className="h-3.5 w-3.5" />
          {locale === "en" ? "العربية" : "English"}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="relative"
        render={<Link href="/ai-insights" aria-label="Unread insights" />}
        nativeButton={false}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -end-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]" variant="destructive">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </header>
  );
}
