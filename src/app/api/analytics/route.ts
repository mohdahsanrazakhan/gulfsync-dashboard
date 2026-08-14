import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError, badRequest } from "@/lib/api-utils";
import { analyticsQuerySchema } from "@/lib/validators";
import { resolvePeriod } from "@/lib/period";

function last12MonthsRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  return { start, end };
}

async function revenueAnalytics(start: Date, end: Date) {
  const { start: trendStart, end: trendEnd } = last12MonthsRange();

  const [byChannelOverTime, byCity] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: trendStart, $lte: trendEnd }, status: "delivered" } },
      {
        $group: {
          _id: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, channel: "$channel" },
          revenue: { $sum: "$payment.totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "delivered" } },
      { $group: { _id: "$customer.city", revenue: { $sum: "$payment.totalAmount" } } },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const monthMap = new Map<string, { month: string; noon: number; amazon: number; shopify: number }>();
  for (const row of byChannelOverTime) {
    const month = row._id.month;
    if (!monthMap.has(month)) monthMap.set(month, { month, noon: 0, amazon: 0, shopify: 0 });
    monthMap.get(month)![row._id.channel as "noon" | "amazon" | "shopify"] = Math.round(row.revenue);
  }

  return {
    revenueByChannelOverTime: Array.from(monthMap.values()),
    revenueByCity: byCity.map((c) => ({ city: c._id, revenue: Math.round(c.revenue) })),
  };
}

async function paymentAnalytics(start: Date, end: Date) {
  const { start: trendStart, end: trendEnd } = last12MonthsRange();

  const [distribution, trend, codByCity, rejectionReasons] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$payment.method", count: { $sum: 1 }, amount: { $sum: "$payment.totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: trendStart, $lte: trendEnd } } },
      {
        $group: {
          _id: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } },
          cod: { $sum: { $cond: [{ $eq: ["$payment.method", "cod"] }, 1, 0] } },
          prepaid: { $sum: { $cond: [{ $eq: ["$payment.method", "cod"] }, 0, 1] } },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "payment.method": "cod" } },
      {
        $group: {
          _id: "$customer.city",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          "payment.method": "cod",
          "return.isReturned": true,
          "return.returnReason": { $ne: null },
        },
      },
      { $group: { _id: "$return.returnReason", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    paymentDistribution: distribution.map((d) => ({ method: d._id, count: d.count, amount: Math.round(d.amount) })),
    codVsPrepaidTrend: trend.map((t) => ({ month: t._id.month, cod: t.cod, prepaid: t.prepaid })),
    codByCity: codByCity.map((c) => ({
      city: c._id,
      rate: c.total === 0 ? 0 : Math.round((c.delivered / c.total) * 1000) / 10,
      total: c.total,
    })),
    codRejectionReasons: rejectionReasons.map((r) => ({ reason: r._id, count: r.count })),
  };
}

async function returnsAnalytics(start: Date, end: Date) {
  const { start: trendStart, end: trendEnd } = last12MonthsRange();

  const [trend, reasons, byCategory, byCity, costAgg] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: trendStart, $lte: trendEnd } } },
      {
        $group: {
          _id: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } },
          total: { $sum: 1 },
          returned: { $sum: { $cond: ["$return.isReturned", 1, 0] } },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "return.isReturned": true } },
      { $group: { _id: "$return.returnReason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "return.isReturned": true } },
      { $unwind: "$items" },
      {
        $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" },
      },
      { $unwind: "$product" },
      { $group: { _id: "$product.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "return.isReturned": true } },
      { $group: { _id: "$customer.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "return.isReturned": true } },
      { $group: { _id: null, shippingCost: { $sum: "$payment.shippingCost" }, count: { $sum: 1 } } },
    ]),
  ]);

  const RESTOCKING_FEE_PER_RETURN = 15;
  const cost = costAgg[0] ?? { shippingCost: 0, count: 0 };
  const costOfReturns = Math.round(cost.shippingCost * 2 + cost.count * RESTOCKING_FEE_PER_RETURN);

  return {
    returnRateTrend: trend.map((t) => ({
      month: t._id.month,
      rate: t.total === 0 ? 0 : Math.round((t.returned / t.total) * 1000) / 10,
    })),
    returnReasons: reasons.map((r) => ({ reason: r._id, count: r.count })),
    returnsByCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    returnsByCity: byCity.map((c) => ({ city: c._id, count: c.count })),
    costOfReturns,
  };
}

async function deliveryAnalytics(start: Date, end: Date) {
  const [byPartner, byCityPartner] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$shipping.partner",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$shipping.status", "failed_delivery"] }, 1, 0] } },
          attempts: { $sum: "$shipping.deliveryAttempts" },
          avgDeliveryDays: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ["$shipping.actualDelivery", null] }] },
                { $divide: [{ $subtract: ["$shipping.actualDelivery", "$createdAt"] }, 86400000] },
                null,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { city: "$customer.city", partner: "$shipping.partner" },
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
    ]),
  ]);

  return {
    successRateByPartner: byPartner.map((p) => ({
      partner: p._id,
      rate: p.total === 0 ? 0 : Math.round((p.delivered / p.total) * 1000) / 10,
    })),
    avgDeliveryTimeByPartner: byPartner.map((p) => ({
      partner: p._id,
      days: p.avgDeliveryDays ? Math.round(p.avgDeliveryDays * 10) / 10 : 0,
    })),
    failedAttemptsByPartner: byPartner.map((p) => ({ partner: p._id, failed: p.failed })),
    performanceByCityPartner: byCityPartner.map((r) => ({
      city: r._id.city,
      partner: r._id.partner,
      total: r.total,
      rate: r.total === 0 ? 0 : Math.round((r.delivered / r.total) * 1000) / 10,
    })),
  };
}

async function productsAnalytics(start: Date, end: Date) {
  const productAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.totalPrice" },
      },
    },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
  ]);

  const topSellers = [...productAgg].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);
  const topByRevenue = [...productAgg].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const bottomSellers = [...productAgg].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 10);

  const categoryMap = new Map<string, number>();
  for (const p of productAgg) {
    const cat = p.product.category as string;
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + p.revenue);
  }

  const shape = (rows: typeof productAgg) =>
    rows.map((r) => ({
      product: { _id: r.product._id, nameEn: r.product.nameEn, sku: r.product.sku, category: r.product.category },
      unitsSold: r.unitsSold,
      revenue: Math.round(r.revenue),
    }));

  return {
    topSellers: shape(topSellers),
    topByRevenue: shape(topByRevenue),
    bottomSellers: shape(bottomSellers),
    categoryRevenue: Array.from(categoryMap.entries()).map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue),
    })),
  };
}

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = analyticsQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      type: searchParams.get("type"),
    });

    const { start, end } = resolvePeriod(query.period);

    let data;
    switch (query.type) {
      case "revenue":
        data = await revenueAnalytics(start, end);
        break;
      case "payment":
        data = await paymentAnalytics(start, end);
        break;
      case "returns":
        data = await returnsAnalytics(start, end);
        break;
      case "delivery":
        data = await deliveryAnalytics(start, end);
        break;
      case "products":
        data = await productsAnalytics(start, end);
        break;
      default:
        throw badRequest("Unsupported analytics type");
    }

    return ok(data);
  } catch (err) {
    return handleApiError(err, { route: "/api/analytics", userId });
  }
}
