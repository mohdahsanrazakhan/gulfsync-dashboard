"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/LocaleContext";

/**
 * Themed logout confirmation modal. Illustration + copy mirror the reference
 * mockup, but every colour is drawn from the dashboard's own design tokens so
 * it matches the app in both light and dark mode.
 */
export function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoggingOut && onOpenChange(o)}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs gap-0 overflow-hidden p-0 text-center"
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          <LogoutIllustration />

          <DialogTitle className="mt-5 font-heading text-xl font-semibold tracking-tight">
            {t("nav.logoutConfirmTitle")}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            {t("nav.logoutConfirmDescription")}
          </DialogDescription>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isLoggingOut}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="lg"
              className="h-11 rounded-xl bg-destructive text-white shadow-sm hover:bg-destructive/90"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut && <LoaderCircle className="me-1.5 h-4 w-4 animate-spin" />}
              {t("nav.logoutConfirmAction")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A figure resting on a bench, themed with the app's secondary (indigo) and
 * destructive (red) tokens so the artwork never clashes with the active theme.
 */
function LogoutIllustration() {
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-secondary/10">
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20"
        role="img"
        aria-hidden="true"
      >
        {/* head */}
        <circle cx="60" cy="34" r="12" className="fill-secondary" />
        {/* body / shirt */}
        <path
          d="M44 78c0-10 7-18 16-18s16 8 16 18v4H44v-4z"
          className="fill-secondary"
        />
        {/* arms resting */}
        <path
          d="M44 66c-5 2-8 6-8 12v4h8V66zM76 66c5 2 8 6 8 12v4h-8V66z"
          className="fill-secondary/70"
        />
        {/* legs */}
        <rect x="50" y="82" width="7" height="18" rx="3.5" className="fill-foreground/80" />
        <rect x="63" y="82" width="7" height="18" rx="3.5" className="fill-foreground/80" />
        {/* bench seat */}
        <rect x="30" y="98" width="60" height="7" rx="3.5" className="fill-destructive" />
        {/* bench legs */}
        <rect x="35" y="104" width="5" height="10" rx="2.5" className="fill-destructive/80" />
        <rect x="80" y="104" width="5" height="10" rx="2.5" className="fill-destructive/80" />
      </svg>
    </div>
  );
}
