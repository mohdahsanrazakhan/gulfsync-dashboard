import { NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import Inventory, { type IInventory } from "@/models/Inventory";
import Product from "@/models/Product";
import { getAuthenticatedSession } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api-utils";
import { inventoryQuerySchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await getAuthenticatedSession();
    userId = session.user.id;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = inventoryQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const filter: QueryFilter<IInventory> = {};
    if (query.status === "mismatch") filter.hasMismatch = true;
    if (query.status === "out_of_stock") {
      filter.$expr = { $eq: ["$stock.warehouse", 0] };
    } else if (query.status === "low_stock") {
      filter.$expr = { $and: [{ $gt: ["$stock.warehouse", 0] }, { $lt: ["$stock.warehouse", "$reorderLevel"] }] };
    } else if (query.status === "in_stock") {
      filter.$expr = { $gte: ["$stock.warehouse", "$reorderLevel"] };
    }

    let productIdFilter: string[] | undefined;
    if (query.category !== "all" || query.search) {
      const productFilter: Record<string, unknown> = {};
      if (query.category !== "all") productFilter.category = query.category;
      if (query.search) {
        const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(safe, "i");
        productFilter.$or = [{ nameEn: regex }, { sku: regex }];
      }
      const matchedProducts = await Product.find(productFilter).select("_id").lean();
      productIdFilter = matchedProducts.map((p) => p._id.toString());
      filter.productId = { $in: productIdFilter };
    }

    const [items, total, summaryAgg] = await Promise.all([
      Inventory.find(filter)
        .sort({ updatedAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate("productId")
        .lean(),
      Inventory.countDocuments(filter),
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            inStock: { $sum: { $cond: [{ $gte: ["$stock.warehouse", "$reorderLevel"] }, 1, 0] } },
            lowStock: {
              $sum: {
                $cond: [{ $and: [{ $gt: ["$stock.warehouse", 0] }, { $lt: ["$stock.warehouse", "$reorderLevel"] }] }, 1, 0],
              },
            },
            outOfStock: { $sum: { $cond: [{ $eq: ["$stock.warehouse", 0] }, 1, 0] } },
            mismatched: { $sum: { $cond: ["$hasMismatch", 1, 0] } },
          },
        },
      ]),
    ]);

    const items2 = items.map((i) => {
      const { productId, ...rest } = i;
      return { ...rest, productId: (productId as unknown as { _id: unknown })?._id ?? productId, product: productId };
    });

    const summary = summaryAgg[0] ?? { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, mismatched: 0 };

    return ok({
      items: items2,
      summary: {
        total: summary.total,
        inStock: summary.inStock,
        lowStock: summary.lowStock,
        outOfStock: summary.outOfStock,
        mismatched: summary.mismatched,
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/inventory", userId });
  }
}
