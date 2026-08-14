"use client";

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocale } from "@/components/providers/LocaleContext";
import { ContentGenerator } from "@/components/ai/ContentGenerator";
import { GeneratedContentPreview, type GeneratedContent } from "@/components/ai/GeneratedContentPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_HISTORY = 5;

export default function AiContentPage() {
  usePageTitle("pageTitles.aiContent");
  const { t } = useLocale();
  const [current, setCurrent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  function handleGenerated(content: GeneratedContent) {
    setCurrent(content);
    setHistory((h) => [content, ...h].slice(0, MAX_HISTORY));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContentGenerator onGenerated={handleGenerated} isGenerating={isGenerating} setIsGenerating={setIsGenerating} />
        <GeneratedContentPreview
          content={current}
          isRegenerating={isGenerating}
          onRegenerate={() => {
            // Regenerate re-uses the last submitted form via the generator's own submit button;
            // here we simply surface the most recent history entry again if present.
            if (history[0]) setCurrent(history[0]);
          }}
        />
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setHistoryOpen((o) => !o)}>
            <CardTitle className="flex items-center justify-between text-base">
              {t("aiContent.history")} ({history.length})
              <span className="text-xs text-muted-foreground">{historyOpen ? "Hide" : "Show"}</span>
            </CardTitle>
          </CardHeader>
          {historyOpen && (
            <CardContent className="space-y-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(item)}
                  className="block w-full rounded-md border p-2 text-start text-sm hover:bg-accent"
                >
                  {item.titleEn}
                </button>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
