"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, LoaderCircle, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleContext";
import type { ApiResponse } from "@/types";
import type { GeneratedContent } from "@/components/ai/GeneratedContentPreview";

export interface ContentFormState {
  productName: string;
  features: string;
  audience: string;
  priceRange: string;
  tone: "professional" | "casual" | "luxury" | "promotional";
  language: "en" | "ar" | "both";
  platform: "noon" | "amazon" | "shopify" | "all";
  keywordsEnabled: boolean;
  keywords: string;
}

const INITIAL_STATE: ContentFormState = {
  productName: "",
  features: "",
  audience: "",
  priceRange: "",
  tone: "professional",
  language: "both",
  platform: "all",
  keywordsEnabled: false,
  keywords: "",
};

export function ContentGenerator({
  onGenerated,
  isGenerating,
  setIsGenerating,
}: {
  onGenerated: (content: GeneratedContent) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}) {
  const { t } = useLocale();
  const [form, setForm] = useState<ContentFormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  const TONE_LABELS: Record<ContentFormState["tone"], string> = {
    professional: t("aiContent.toneProfessional"),
    casual: t("aiContent.toneCasual"),
    luxury: t("aiContent.toneLuxury"),
    promotional: t("aiContent.tonePromotional"),
  };

  const LANGUAGE_LABELS: Record<ContentFormState["language"], string> = {
    both: t("aiContent.languageBoth"),
    en: t("aiContent.languageEnOnly"),
    ar: t("aiContent.languageArOnly"),
  };

  const PLATFORM_LABELS: Record<ContentFormState["platform"], string> = {
    all: t("aiContent.platformAll"),
    noon: "Noon",
    amazon: "Amazon",
    shopify: "Shopify",
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.productName.trim()) {
      setError(t("aiContent.productNameRequired"));
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName,
          features: form.features,
          audience: form.audience,
          priceRange: form.priceRange,
          tone: form.tone,
          language: form.language,
          platform: form.platform,
          keywords: form.keywordsEnabled
            ? form.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : [],
        }),
      });
      const body = (await res.json()) as ApiResponse<GeneratedContent>;
      if (!body.success) throw new Error(body.error);
      onGenerated(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("aiContent.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="border-none shadow-sm ring-1 ring-foreground/10">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base">{t("aiContent.productDetails")}</CardTitle>
            <CardDescription>{t("aiContent.productDetailsHint")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="productName">{t("aiContent.productName")}</Label>
            <Input
              id="productName"
              maxLength={200}
              className="h-10"
              value={form.productName}
              onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
              placeholder={t("aiContent.productNamePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="features">{t("aiContent.features")}</Label>
            <Textarea
              id="features"
              maxLength={500}
              rows={3}
              value={form.features}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              placeholder={t("aiContent.featuresPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="audience">{t("aiContent.audience")}</Label>
              <Input
                id="audience"
                maxLength={200}
                className="h-10"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                placeholder={t("aiContent.audiencePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priceRange">{t("aiContent.priceRange")}</Label>
              <Input
                id="priceRange"
                maxLength={100}
                className="h-10"
                value={form.priceRange}
                onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                placeholder={t("aiContent.priceRangePlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/30 p-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("aiContent.tone")}</Label>
              <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v as ContentFormState["tone"] }))}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>{(v: ContentFormState["tone"]) => TONE_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">{TONE_LABELS.professional}</SelectItem>
                  <SelectItem value="casual">{TONE_LABELS.casual}</SelectItem>
                  <SelectItem value="luxury">{TONE_LABELS.luxury}</SelectItem>
                  <SelectItem value="promotional">{TONE_LABELS.promotional}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("aiContent.language")}</Label>
              <Select value={form.language} onValueChange={(v) => setForm((f) => ({ ...f, language: v as ContentFormState["language"] }))}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>{(v: ContentFormState["language"]) => LANGUAGE_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{LANGUAGE_LABELS.both}</SelectItem>
                  <SelectItem value="en">{LANGUAGE_LABELS.en}</SelectItem>
                  <SelectItem value="ar">{LANGUAGE_LABELS.ar}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("aiContent.platform")}</Label>
              <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v as ContentFormState["platform"] }))}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>{(v: ContentFormState["platform"]) => PLATFORM_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{PLATFORM_LABELS.all}</SelectItem>
                  <SelectItem value="noon">Noon</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={cn(
              "space-y-2.5 rounded-xl border p-3 transition-colors",
              form.keywordsEnabled ? "border-secondary/40 bg-secondary/5" : "bg-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id="keywordsEnabled"
                checked={form.keywordsEnabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, keywordsEnabled: !!v }))}
              />
              <Label htmlFor="keywordsEnabled" className="cursor-pointer gap-1.5 font-normal">
                <Tags className="h-3.5 w-3.5 text-muted-foreground" />
                {t("aiContent.includeSeoKeywords")}
              </Label>
            </div>
            {form.keywordsEnabled && (
              <Input
                className="h-10 bg-background"
                maxLength={300}
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder={t("aiContent.keywordsPlaceholder")}
              />
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-sm transition-transform active:scale-[0.99]"
            disabled={isGenerating}
          >
            {isGenerating ? <LoaderCircle className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t("aiContent.generateContent")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
