import { cn } from "@/lib/utils";
import { CHANNEL_LABELS, CHANNEL_COLORS } from "@/lib/constants";
import type { Channel } from "@/types";

export function ChannelBadge({ channel, className }: { channel: Channel; className?: string }) {
  const color = CHANNEL_COLORS[channel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{ borderColor: `${color}55`, backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {CHANNEL_LABELS[channel]}
    </span>
  );
}
