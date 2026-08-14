"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLocale } from "@/components/providers/LocaleContext";

export interface GeneratedContent {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  metaTitleEn: string;
  metaTitleAr: string;
  metaDescEn: string;
  metaDescAr: string;
  bulletsEn: string[];
  bulletsAr: string[];
  tags: string[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Section({ label, textEn, textAr }: { label: string; textEn?: string; textAr?: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h4>
      {textEn !== undefined && (
        <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/40 p-2.5 text-sm">
          <p>{textEn}</p>
          <CopyButton text={textEn} />
        </div>
      )}
      {textAr !== undefined && (
        <div dir="rtl" className="flex items-start justify-between gap-2 rounded-md border bg-muted/40 p-2.5 text-sm font-arabic">
          <p>{textAr}</p>
          <CopyButton text={textAr} />
        </div>
      )}
    </div>
  );
}

export function GeneratedContentPreview({
  content,
  onRegenerate,
  isRegenerating,
}: {
  content: GeneratedContent | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const { t } = useLocale();

  if (!content) {
    return <EmptyState title={t("aiContent.nothingYet")} description={t("aiContent.nothingYetHint")} />;
  }

  const allText = [
    content.titleEn,
    content.titleAr,
    content.descriptionEn,
    content.descriptionAr,
    content.metaTitleEn,
    content.metaTitleAr,
    content.metaDescEn,
    content.metaDescAr,
    ...content.bulletsEn,
    ...content.bulletsAr,
    content.tags.join(", "),
  ].join("\n\n");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t("aiContent.generatedContent")}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isRegenerating}>
            {t("common.regenerate")}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(allText);
            }}
          >
            {t("common.copyAll")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section label={t("aiContent.titleLabel")} textEn={content.titleEn} textAr={content.titleAr} />
        <Separator />
        <Section label={t("aiContent.descriptionLabel")} textEn={content.descriptionEn} textAr={content.descriptionAr} />
        <Separator />
        <Section label={t("aiContent.metaTitleLabel")} textEn={content.metaTitleEn} textAr={content.metaTitleAr} />
        <Section label={t("aiContent.metaDescLabel")} textEn={content.metaDescEn} textAr={content.metaDescAr} />
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("aiContent.bulletsEn")}</h4>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {content.bulletsEn.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <div dir="rtl">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("aiContent.bulletsAr")}</h4>
            <ul className="list-inside list-disc space-y-1 text-sm font-arabic">
              {content.bulletsAr.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("aiContent.tagsLabel")}</h4>
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
