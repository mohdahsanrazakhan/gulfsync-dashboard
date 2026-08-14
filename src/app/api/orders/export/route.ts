import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getAuthenticatedSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";
import { ordersQuerySchema } from "@/lib/validators";
import { buildOrderFilter } from "@/lib/order-filter";

const CSV_MAX_ROWS = 20000;

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = ordersQuerySchema.parse(Object.fromEntries(searchParams.entries()));
    const filter = buildOrderFilter(query);

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(CSV_MAX_ROWS).lean();

    const headers = [
      "Order ID",
      "Channel",
      "Status",
      "Customer",
      "City",
      "Country",
      "Items",
      "Payment Method",
      "Payment Status",
      "Currency",
      "Total Amount",
      "Delivery Partner",
      "Delivery Status",
      "Created At",
    ];

    const rows = orders.map((o) =>
      [
        o.orderId,
        o.channel,
        o.status,
        o.customer.name,
        o.customer.city,
        o.customer.country,
        o.items.map((i) => `${i.nameEn} x${i.quantity}`).join("; "),
        o.payment.method,
        o.payment.status,
        o.payment.currency,
        o.payment.totalAmount,
        o.shipping.partner,
        o.shipping.status,
        new Date(o.createdAt).toISOString(),
      ]
        .map(csvEscape)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/orders/export", userId });
  }
}
