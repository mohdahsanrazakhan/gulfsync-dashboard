import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Insight from "@/models/Insight";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { insightsQuerySchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = insightsQuerySchema.parse({ filter: searchParams.get("filter") ?? undefined });

    const filter = query.filter === "unread" ? { isRead: false } : {};
    const insights = await Insight.find(filter).sort({ createdAt: -1 }).lean();

    return ok({ insights });
  } catch (err) {
    return handleApiError(err, { route: "/api/ai/insights", userId });
  }
}
