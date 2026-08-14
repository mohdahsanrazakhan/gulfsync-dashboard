import { connectDB } from "@/lib/db";
import Insight from "@/models/Insight";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError, notFound } from "@/lib/api-utils";
import { insightIdParamSchema } from "@/lib/validators";

export async function PATCH(_req: Request, context: { params: Promise<{ id: string }> }) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { id } = insightIdParamSchema.parse(await context.params);

    const updated = await Insight.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!updated) throw notFound("Insight not found");

    return ok({ id });
  } catch (err) {
    return handleApiError(err, { route: "/api/ai/insights/[id]/read", userId });
  }
}
