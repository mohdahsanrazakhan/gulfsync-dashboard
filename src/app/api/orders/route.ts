import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { ordersQuerySchema } from "@/lib/validators";
import { buildOrderFilter } from "@/lib/order-filter";

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = ordersQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const filter = buildOrderFilter(query);
    const sortField = query.sort === "totalAmount" ? "payment.totalAmount" : query.sort;
    const sort: Record<string, 1 | -1> = { [sortField]: query.order === "asc" ? 1 : -1 };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return ok({
      orders,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/orders", userId });
  }
}
