"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCircle2,
  Globe,
  LoaderCircle,
  Mail,
  Plug,
  TriangleAlert,
  User,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDashboardContext } from "@/components/providers/DashboardContext";
import { useLocale } from "@/components/providers/LocaleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Icon-badge + title/description header used across every settings card for a consistent look. */
function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "default",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  tone?: "default" | "destructive";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="space-y-0.5 pt-0.5">
        <CardTitle className={cn("text-base", tone === "destructive" && "text-destructive")}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle("pageTitles.settings");
  const { data: session } = useSession();
  const { currency, setCurrency } = useDashboardContext();
  const { locale, setLocale, t } = useLocale();
  const [notifications, setNotifications] = useState({ email: true, lowStock: true, insights: true });
  const [clearResult, setClearResult] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  async function handleClearData() {
    setClearResult(null);
    setIsClearing(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.status === 401) {
        setClearResult(
          "Reseeding requires a server-side seed key that is never exposed to the browser. Run `npx tsx scripts/seed.ts` (or supply x-seed-key) from a trusted environment instead."
        );
        return;
      }
      const body = await res.json();
      setClearResult(body.success ? body.data.message : body.error);
    } catch {
      setClearResult("Failed to reach the seed endpoint.");
    } finally {
      setIsClearing(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">{t("settings.pageIntro")}</p>

      <Card className="border-none shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={User} title={t("settings.profile")} description={t("settings.profileHint")} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">{t("settings.name")}</Label>
            <div className="relative">
              <User className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-name"
                className="h-10 ps-8"
                value={session?.user?.name ?? "Demo User"}
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">{t("settings.email")}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-email"
                className="h-10 ps-8"
                value={session?.user?.email ?? ""}
                readOnly
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={Globe} title={t("settings.display")} />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label>{t("settings.currency")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.currencyHint")}</p>
            </div>
            <Select value={currency} onValueChange={(v) => setCurrency(v as "SAR" | "AED")}>
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue>{(v: "SAR" | "AED") => v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label>{t("settings.language")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.languageHint")}</p>
            </div>
            <Select value={locale} onValueChange={(v) => setLocale(v as "en" | "ar")}>
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue>{(v: "en" | "ar") => (v === "en" ? "English" : "العربية")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={Plug} title={t("settings.channels")} description={t("settings.channelsHint")} />
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {(["noon", "amazon", "shopify"] as const).map((ch) => (
            <div
              key={ch}
              className="flex flex-col gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <ChannelBadge channel={ch} />
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("settings.connected")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={Bell} title={t("settings.notifications")} description={t("settings.notificationsHint")} />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="email-alerts" className="font-normal">
                {t("settings.emailAlerts")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("settings.emailAlertsHint")}</p>
            </div>
            <Switch
              id="email-alerts"
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="lowstock-alerts" className="font-normal">
                {t("settings.lowStockAlerts")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("settings.lowStockAlertsHint")}</p>
            </div>
            <Switch
              id="lowstock-alerts"
              checked={notifications.lowStock}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, lowStock: v }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="insight-alerts" className="font-normal">
                {t("settings.insightAlerts")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("settings.insightAlertsHint")}</p>
            </div>
            <Switch
              id="insight-alerts"
              checked={notifications.insights}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, insights: v }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 shadow-sm">
        <CardHeader className="border-b border-destructive/20 pb-4">
          <SectionHeader icon={TriangleAlert} title={t("settings.dangerZone")} description={t("settings.dangerZoneHint")} tone="destructive" />
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            {t("settings.clearAllData")}
          </Button>
          {clearResult && <p className="text-sm text-muted-foreground">{clearResult}</p>}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(open) => !isClearing && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-4 w-4" /> {t("settings.clearAllDataConfirmTitle")}
            </DialogTitle>
            <DialogDescription>{t("settings.clearAllDataConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isClearing}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleClearData} disabled={isClearing}>
              {isClearing && <LoaderCircle className="me-2 h-4 w-4 animate-spin" />}
              {t("settings.clearAllDataConfirmAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
