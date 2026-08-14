import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Insight from "@/models/Insight";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { getOpenAIClient } from "@/lib/openai";
import { AI_MAX_TOKENS, AI_MODEL, INSIGHT_TYPES, INSIGHT_SEVERITIES } from "@/lib/constants";
import { z } from "zod";

const generatedInsightSchema = z.object({
  type: z.enum(INSIGHT_TYPES),
  severity: z.enum(INSIGHT_SEVERITIES),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  metric: z.string().min(1).max(200),
  recommendation: z.string().min(1).max(1000),
});

const generatedResponseSchema = z.object({
  insights: z.array(generatedInsightSchema).min(1).max(3),
});

const SYSTEM_PROMPT = `You are a senior e-commerce data analyst for a Gulf multi-channel seller (Noon, Amazon.ae, Shopify).
Given a summarized snapshot of the seller's recent performance, produce 2-3 short, specific, actionable business insights.
Respond ONLY as strict JSON matching this shape:
{ "insights": [ { "type": "revenue|cod|returns|inventory|delivery|product", "severity": "info|warning|critical|opportunity", "title": string, "description": string (2-3 sentences), "metric": string (a short highlighted stat), "recommendation": string (one actionable sentence) } ] }`;

async function buildDataSummary() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [statusAgg, channelAgg, codAgg, returnAgg] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: "delivered" } },
      { $group: { _id: "$channel", revenue: { $sum: "$payment.totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, "payment.method": "cod" } },
      {
        $group: {
          _id: "$customer.city",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, "return.isReturned": true } },
      { $group: { _id: "$return.returnReason", count: { $sum: 1 } } },
    ]),
  ]);

  return { statusAgg, channelAgg, codAgg, returnAgg };
}

export async function POST() {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const summary = await buildDataSummary();

    let parsed: z.infer<typeof generatedResponseSchema> | null = null;

    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Last 30 days data summary (JSON): ${JSON.stringify(summary).slice(0, 4000)}` },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      parsed = generatedResponseSchema.parse(JSON.parse(raw));
    } catch (aiError) {
      // Graceful degradation: log server-side, fall back to a safe generic insight
      // rather than surfacing the AI/API error to the client.
      console.error("[AI insights generate] OpenAI call failed", aiError);
    }

    const toInsert = parsed
      ? parsed.insights
      : [
          {
            type: "revenue" as const,
            severity: "info" as const,
            title: "AI Insight Generation Temporarily Unavailable",
            description:
              "We couldn't reach the AI service just now. Your existing insights are still accurate and up to date.",
            metric: "N/A",
            recommendation: "Try generating new insights again in a few minutes.",
          },
        ];

    const created = await Insight.insertMany(
      toInsert.map((i) => ({ ...i, dataPoints: {}, isRead: false })),
      { ordered: true }
    );

    return ok({ insights: created });
  } catch (err) {
    return handleApiError(err, { route: "/api/ai/insights/generate", userId });
  }
}
