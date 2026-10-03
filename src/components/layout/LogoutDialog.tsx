"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LoaderCircle, LogOut } from "lucide-react";
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
 * Logout glyph set in concentric themed rings, built from the app's destructive
 * token so it reads as a "sign out" action and matches the theme in both modes.
 */
function LogoutIllustration() {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-sm shadow-destructive/30">
          <LogOut className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
