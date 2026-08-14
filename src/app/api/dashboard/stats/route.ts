import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Insight from "@/models/Insight";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { dashboardStatsQuerySchema } from "@/lib/validators";
import { resolvePeriod } from "@/lib/period";

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = dashboardStatsQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      currency: searchParams.get("currency") ?? undefined,
    });

    const { start, end, prevStart, prevEnd } = resolvePeriod(query.period);

    const [currentAgg, previousAgg] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$payment.totalAmount", 0] },
            },
            orders: { $sum: 1 },
            codOrders: { $sum: { $cond: [{ $eq: ["$payment.method", "cod"] }, 1, 0] } },
            codDelivered: {
              $sum: {
                $cond: [{ $and: [{ $eq: ["$payment.method", "cod"] }, { $eq: ["$status", "delivered"] }] }, 1, 0],
              },
            },
            returned: { $sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$payment.totalAmount", 0] },
            },
            orders: { $sum: 1 },
            codOrders: { $sum: { $cond: [{ $eq: ["$payment.method", "cod"] }, 1, 0] } },
            codDelivered: {
              $sum: {
                $cond: [{ $and: [{ $eq: ["$payment.method", "cod"] }, { $eq: ["$status", "delivered"] }] }, 1, 0],
              },
            },
            returned: { $sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const cur = currentAgg[0] ?? { revenue: 0, orders: 0, codOrders: 0, codDelivered: 0, returned: 0 };
    const prev = previousAgg[0] ?? { revenue: 0, orders: 0, codOrders: 0, codDelivered: 0, returned: 0 };

    const pctChange = (c: number, p: number) => (p === 0 ? (c > 0 ? 100 : 0) : Math.round(((c - p) / p) * 1000) / 10);

    const curCodRate = cur.codOrders === 0 ? 0 : Math.round((cur.codDelivered / cur.codOrders) * 1000) / 10;
    const prevCodRate = prev.codOrders === 0 ? 0 : Math.round((prev.codDelivered / prev.codOrders) * 1000) / 10;
    const curReturnRate = cur.orders === 0 ? 0 : Math.round((cur.returned / cur.orders) * 1000) / 10;
    const prevReturnRate = prev.orders === 0 ? 0 : Math.round((prev.returned / prev.orders) * 1000) / 10;

    // Sparkline: daily revenue/order counts for the last 30 days.
    const sparkStart = new Date(end.getTime() - 30 * 86400000);
    const sparklineAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sparkStart, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$payment.totalAmount", 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const revenueSparkline = sparklineAgg.map((d) => Math.round(d.revenue));
    const ordersSparkline = sparklineAgg.map((d) => d.orders);

    // Revenue by channel + by day (for chart), within selected period.
    const byDayChannel = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "delivered" } },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, channel: "$channel" },
          revenue: { $sum: "$payment.totalAmount" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const dayMap = new Map<string, { date: string; noon: number; amazon: number; shopify: number }>();
    for (const row of byDayChannel) {
      const date = row._id.date;
      if (!dayMap.has(date)) dayMap.set(date, { date, noon: 0, amazon: 0, shopify: 0 });
      const entry = dayMap.get(date)!;
      entry[row._id.channel as "noon" | "amazon" | "shopify"] = Math.round(row.revenue);
    }
    const revenueByDay = Array.from(dayMap.values());
    const revenueByChannel = revenueByDay.reduce(
      (acc, d) => ({ noon: acc.noon + d.noon, amazon: acc.amazon + d.amazon, shopify: acc.shopify + d.shopify }),
      { noon: 0, amazon: 0, shopify: 0 }
    );

    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10).lean();

    const topProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" },
      },
      { $unwind: "$product" },
    ]);
    const topProducts = topProductsAgg.map((p) => ({
      product: p.product,
      unitsSold: p.unitsSold,
      revenue: Math.round(p.revenue),
    }));

    const codByCityAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, "payment.method": "cod" } },
      {
        $group: {
          _id: "$customer.city",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]);
    const codByCity = codByCityAgg.map((c) => ({
      city: c._id,
      total: c.total,
      rate: c.total === 0 ? 0 : Math.round((c.delivered / c.total) * 1000) / 10,
    }));

    const [lowStock, mismatches, unreadInsights] = await Promise.all([
      Inventory.countDocuments({ $expr: { $lt: ["$stock.warehouse", "$reorderLevel"] } }),
      Inventory.countDocuments({ hasMismatch: true }),
      Insight.countDocuments({ isRead: false }),
    ]);

    return ok({
      revenue: {
        current: Math.round(cur.revenue),
        previous: Math.round(prev.revenue),
        changePercent: pctChange(cur.revenue, prev.revenue),
        sparkline: revenueSparkline,
      },
      orders: {
        current: cur.orders,
        previous: prev.orders,
        changePercent: pctChange(cur.orders, prev.orders),
        sparkline: ordersSparkline,
      },
      codRate: { current: curCodRate, previous: prevCodRate, changePercent: pctChange(curCodRate, prevCodRate) },
      returnRate: {
        current: curReturnRate,
        previous: prevReturnRate,
        changePercent: pctChange(curReturnRate, prevReturnRate),
      },
      revenueByChannel,
      revenueByDay,
      recentOrders,
      topProducts,
      codByCity,
      alerts: { lowStock, mismatches, unreadInsights },
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/dashboard/stats", userId });
  }
}
