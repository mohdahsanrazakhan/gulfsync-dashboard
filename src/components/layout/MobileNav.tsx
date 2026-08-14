"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, ClipboardList, LineChart, Sparkles, PenSquare, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { useLocale } from "@/components/providers/LocaleContext";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard },
  { href: "/orders", key: "nav.orders", icon: Package },
  { href: "/inventory", key: "nav.inventory", icon: ClipboardList },
  { href: "/analytics", key: "nav.analytics", icon: LineChart },
];

const MENU_ONLY_ITEMS = [
  { href: "/ai-insights", key: "nav.aiInsights", icon: Sparkles },
  { href: "/ai-content", key: "nav.aiContent", icon: PenSquare },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export function MobileNavTrigger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, dir } = useLocale();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-64 bg-sidebar text-sidebar-foreground">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
            <span className="flex shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
              <Image src="/brand/logo.png" alt={APP_NAME} width={384} height={384} className="h-6 w-auto" />
            </span>
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-3">
          {[...NAV_ITEMS, ...MENU_ONLY_ITEMS].map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.logout")}
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
              isActive ? "text-secondary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
