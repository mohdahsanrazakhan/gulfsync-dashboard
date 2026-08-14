"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";

export function MismatchAlert({ count, onJump }: { count: number; onJump: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const { locale } = useLocale();
  if (dismissed || count === 0) return null;

  const message =
    locale === "ar"
      ? `${count} منتج${count === 1 ? "" : "ات"} به تعارض في المخزون بين القنوات`
      : `${count} product${count === 1 ? "" : "s"} have inventory mismatches across channels`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800"
      )}
    >
      <button onClick={onJump} className="flex items-center gap-2 text-start font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {message}
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0 text-orange-600 hover:text-orange-800">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
