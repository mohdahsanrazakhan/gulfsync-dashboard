import type { QueryFilter } from "mongoose";
import type { IOrder } from "@/models/Order";
import type { ordersQuerySchema } from "@/lib/validators";

export function buildOrderFilter(query: ReturnType<typeof ordersQuerySchema.parse>): QueryFilter<IOrder> {
  const filter: QueryFilter<IOrder> = {};

  if (query.channel !== "all") filter.channel = query.channel;
  if (query.status !== "all") filter.status = query.status;
  if (query.payment !== "all") filter["payment.method"] = query.payment;
  if (query.partner !== "all") filter["shipping.partner"] = query.partner;
  if (query.city) filter["customer.city"] = query.city;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  if (query.search) {
    const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    filter.$or = [{ orderId: regex }, { "customer.name": regex }, { "items.sku": regex }];
  }

  return filter;
}
