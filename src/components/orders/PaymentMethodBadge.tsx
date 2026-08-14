"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";
import type { PaymentMethod } from "@/types";

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const { t } = useLocale();
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium",
        method === "cod"
          ? "border-warning/40 bg-warning/15 text-amber-700"
          : "border-border bg-muted text-foreground/80"
      )}
    >
      {t(`paymentMethods.${method}`)}
    </Badge>
  );
}
