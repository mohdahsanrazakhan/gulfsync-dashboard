import { cn } from "@/lib/utils";

export function StockLevelBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const color = value === 0 ? "bg-destructive" : pct < 30 ? "bg-warning" : "bg-accent";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="w-8 shrink-0 tabular-nums text-sm">{value}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
