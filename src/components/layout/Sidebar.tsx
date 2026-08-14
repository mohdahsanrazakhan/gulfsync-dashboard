"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LineChart,
  Sparkles,
  PenSquare,
  Settings,
  LogOut,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { APP_NAME } from "@/lib/constants";
import { useLocale } from "@/components/providers/LocaleContext";

const NAV_ITEMS = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard },
  { href: "/orders", key: "nav.orders", icon: Package },
  { href: "/inventory", key: "nav.inventory", icon: ClipboardList },
  { href: "/analytics", key: "nav.analytics", icon: LineChart },
  { href: "/ai-insights", key: "nav.aiInsights", icon: Sparkles },
  { href: "/ai-content", key: "nav.aiContent", icon: PenSquare },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLocale();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[1px_0_0_0_rgba(0,0,0,0.04)] transition-[width] duration-200 ease-in-out md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-sidebar-border/60 px-4",
          collapsed ? "h-24 flex-col justify-center gap-2.5 px-2" : "h-16 justify-between"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image src="/brand/logo.png" alt={APP_NAME} width={384} height={384} className="h-6 w-auto" priority />
          </div>
          {!collapsed && <span className="truncate text-lg font-semibold tracking-tight">{APP_NAME}</span>}
        </div>
        <button
          type="button"
          onClick={() => setInternalCollapsed((c) => !c)}
          aria-label={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
          title={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border/60 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const label = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border/60 bg-black/10 p-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-xs text-white">
              {(session?.user?.name ?? "D U")
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{session?.user?.name ?? "Demo User"}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{session?.user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
