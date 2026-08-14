"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { InsightCard } from "@/components/ai/InsightCard";
import { useFetch } from "@/hooks/useFetch";
import { useLocale } from "@/components/providers/LocaleContext";
import type { Insight, ApiResponse } from "@/types";

export function InsightsPanel({ initialFilter = "all" }: { initialFilter?: "all" | "unread" }) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | "unread">(initialFilter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useFetch<{ insights: Insight[] }>(`/api/ai/insights?filter=${filter}`);

  async function handleMarkRead(id: string) {
    await fetch(`/api/ai/insights/${id}/read`, { method: "PATCH" });
    refetch();
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/ai/insights/generate", { method: "POST" });
      const body = (await res.json()) as ApiResponse<{ insights: Insight[] }>;
      if (!body.success) throw new Error(body.error);
      refetch();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">{t("aiInsights.all")}</TabsTrigger>
            <TabsTrigger value="unread">{t("aiInsights.unread")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <LoaderCircle className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
          {t("aiInsights.generateNew")}
        </Button>
      </div>

      {genError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {genError}
        </div>
      )}

      {isLoading && <LoadingSpinner label={t("common.loading")} />}
      {error && !isLoading && <EmptyState title={t("common.noResults")} description={error} />}

      {data && !isLoading && (
        <>
          {data.insights.length === 0 ? (
            <EmptyState title={t("aiInsights.noInsights")} description={t("aiInsights.noInsightsHint")} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.insights.map((insight) => (
                <InsightCard key={insight._id} insight={insight} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
