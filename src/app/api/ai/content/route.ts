import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { aiContentSchema } from "@/lib/validators";
import { getOpenAIClient, sanitizeAiInput } from "@/lib/openai";
import { AI_MAX_TOKENS, AI_MODEL } from "@/lib/constants";

const SYSTEM_PROMPT = `You are an expert e-commerce content writer specializing in the Gulf market
(UAE and Saudi Arabia). Generate product content that:
1. Is culturally appropriate for the Gulf audience
2. Uses SEO best practices for Noon, Amazon.ae, and Shopify
3. Includes relevant Arabic keywords naturally
4. Highlights features that Gulf consumers care about (quality, brand authenticity, fast delivery)
5. Uses persuasive but honest language
6. Follows the specified tone (professional/casual/luxury/promotional)

Format your response as JSON with these fields:
titleEn, titleAr, descriptionEn, descriptionAr,
metaTitleEn, metaTitleAr, metaDescEn, metaDescAr,
bulletsEn (array of 5), bulletsAr (array of 5),
tags (array of 10)`;

const aiOutputSchema = z.object({
  titleEn: z.string(),
  titleAr: z.string(),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
  metaTitleEn: z.string(),
  metaTitleAr: z.string(),
  metaDescEn: z.string(),
  metaDescAr: z.string(),
  bulletsEn: z.array(z.string()).length(5).or(z.array(z.string())),
  bulletsAr: z.array(z.string()).length(5).or(z.array(z.string())),
  tags: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;

    const body = await req.json();
    const input = aiContentSchema.parse(body);

    // Defense-in-depth: re-sanitize even though the Zod schema already strips
    // HTML/tags and caps length.
    const productName = sanitizeAiInput(input.productName, 200);
    const features = sanitizeAiInput(input.features, 500);
    const audience = sanitizeAiInput(input.audience, 200);
    const priceRange = sanitizeAiInput(input.priceRange, 100);
    const keywords = input.keywords.map((k) => sanitizeAiInput(k, 60)).slice(0, 20);

    const userPrompt = [
      `Product name: ${productName}`,
      features && `Key features: ${features}`,
      audience && `Target audience: ${audience}`,
      priceRange && `Price range: ${priceRange}`,
      `Tone: ${input.tone}`,
      `Language: ${input.language}`,
      `Platform: ${input.platform}`,
      keywords.length ? `SEO keywords to include: ${keywords.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    let data: z.infer<typeof aiOutputSchema>;
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      data = aiOutputSchema.parse(JSON.parse(raw));
    } catch (aiError) {
      console.error("[AI content] OpenAI call failed", aiError);
      // Graceful fallback content so the UI never breaks if the AI API fails.
      data = {
        titleEn: productName,
        titleAr: productName,
        descriptionEn:
          "AI content generation is temporarily unavailable. Please try again shortly, or edit this placeholder manually.",
        descriptionAr: "خدمة توليد المحتوى بالذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.",
        metaTitleEn: productName,
        metaTitleAr: productName,
        metaDescEn: "Product description unavailable.",
        metaDescAr: "وصف المنتج غير متوفر حالياً.",
        bulletsEn: ["Feature information unavailable"],
        bulletsAr: ["معلومات الميزة غير متوفرة"],
        tags: keywords,
      };
    }

    return ok(data);
  } catch (err) {
    return handleApiError(err, { route: "/api/ai/content", userId });
  }
}
