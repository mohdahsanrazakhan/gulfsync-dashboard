"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { useLocale } from "@/components/providers/LocaleContext";
import type { InventoryItem } from "@/hooks/useInventory";

function statusFor(item: InventoryItem, t: (path: string) => string): { label: string; className: string; rowBorder: string } {
  if (item.hasMismatch)
    return { label: t("inventory.mismatched"), className: "bg-orange-100 text-orange-700 border-orange-200", rowBorder: "border-s-orange-400" };
  if (item.stock.warehouse === 0)
    return { label: t("inventory.outOfStock"), className: "bg-red-100 text-red-700 border-red-200", rowBorder: "border-s-red-400" };
  if (item.stock.warehouse < item.reorderLevel)
    return { label: t("inventory.lowStock"), className: "bg-amber-100 text-amber-700 border-amber-200", rowBorder: "border-s-amber-400" };
  return { label: t("inventory.inStock"), className: "bg-emerald-100 text-emerald-700 border-emerald-200", rowBorder: "border-s-transparent" };
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const { t } = useLocale();

  if (items.length === 0) {
    return <EmptyState title={t("inventory.noMatch")} />;
  }

  const maxStock = Math.max(1, ...items.map((i) => Math.max(i.stock.warehouse, i.stock.noon, i.stock.amazon, i.stock.shopify)));

  return (
    <DataTable
      headers={[
        t("inventory.product"),
        t("inventory.warehouse"),
        "Noon",
        "Amazon",
        "Shopify",
        t("common.status"),
        t("inventory.reorderLevel"),
        t("inventory.lastSynced"),
      ]}
    >
      {items.map((item) => {
        const status = statusFor(item, t);
        return (
          <TableRow key={item._id} className={cn("border-s-4", status.rowBorder)}>
            <TableCell>
              <p className="font-medium">{item.product?.nameEn ?? "Unknown product"}</p>
              <p className="text-xs text-muted-foreground">
                {item.sku} · {item.product?.category}
              </p>
            </TableCell>
            <TableCell>
              <StockLevelBar value={item.stock.warehouse} max={maxStock} />
            </TableCell>
            <TableCell>
              <StockLevelBar value={item.stock.noon} max={maxStock} />
            </TableCell>
            <TableCell>
              <StockLevelBar value={item.stock.amazon} max={maxStock} />
            </TableCell>
            <TableCell>
              <StockLevelBar value={item.stock.shopify} max={maxStock} />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("rounded-full font-medium", status.className)}>
                {status.label}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">{item.reorderLevel}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(item.lastSyncedAt.noon)}
            </TableCell>
          </TableRow>
        );
      })}
    </DataTable>
  );
}
