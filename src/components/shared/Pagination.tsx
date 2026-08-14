"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";

const DEFAULT_PAGE_SIZES = [25, 50, 100];

/**
 * Builds a compact page-number sequence like [1, "…", 4, 5, 6, "…", 200],
 * always keeping the first/last page and a window around the current one.
 */
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];
  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);

  items.push(1);
  if (windowStart > 2) items.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p++) items.push(p);
  if (windowEnd < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  itemLabel,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  itemLabel: string;
  pageSizeOptions?: number[];
  className?: string;
}) {
  const { t } = useLocale();
  const pageItems = getPageItems(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{total.toLocaleString()}</span> {itemLabel}
        </span>

        <div className="flex items-center gap-2 sm:ms-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">{t("common.showPerPage")}</span>
          <Select value={String(limit)} onValueChange={(v) => v && onLimitChange(Number(v))}>
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue>{(v: string) => v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 sm:justify-end">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("common.previous")}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {pageItems.map((item, i) =>
              item === "ellipsis" ? (
                <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors",
                    item === page
                      ? "bg-secondary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("common.next")}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
