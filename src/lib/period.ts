export interface PeriodRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

/**
 * Resolves a period shorthand ("7d" | "30d" | "90d" | "12m") into a
 * [start, end] window plus the equivalent-length preceding window, used for
 * period-over-period comparisons.
 */
export function resolvePeriod(period: string, customStart?: string, customEnd?: string): PeriodRange {
  const end = customEnd ? new Date(customEnd) : new Date();
  let days: number;

  switch (period) {
    case "7d":
      days = 7;
      break;
    case "90d":
      days = 90;
      break;
    case "12m":
      days = 365;
      break;
    case "custom":
      days =
        customStart && customEnd
          ? Math.max(1, Math.round((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000))
          : 30;
      break;
    case "30d":
    default:
      days = 30;
  }

  const start = customStart ? new Date(customStart) : new Date(end.getTime() - days * 86400000);
  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - spanMs);

  return { start, end, prevStart, prevEnd };
}
