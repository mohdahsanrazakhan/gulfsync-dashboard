"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function AiInsightsInner() {
  usePageTitle("pageTitles.aiInsights");
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") === "unread" ? "unread" : "all";
  return <InsightsPanel initialFilter={initialFilter} />;
}

export default function AiInsightsPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading insights..." />}>
      <AiInsightsInner />
    </Suspense>
  );
}
