import { NextRequest } from "next/server";
import { ok, fail, handleApiError } from "@/lib/api-utils";
import { runSeed } from "@/seed/seed";

/**
 * Development-only database seeding endpoint. Locked down two ways:
 *  1. Only runs when NODE_ENV !== 'production'.
 *  2. Requires a valid x-seed-key header matching process.env.SEED_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return fail("Seeding is disabled in production", 403);
    }

    const seedSecret = process.env.SEED_SECRET;
    const providedKey = req.headers.get("x-seed-key");

    if (!seedSecret || !providedKey || providedKey !== seedSecret) {
      return fail("Invalid or missing seed key", 401);
    }

    const messages: string[] = [];
    const result = await runSeed((msg) => messages.push(msg));

    return ok({
      message: `Database seeded with ${result.orders} orders, ${result.products} products, ${result.inventory} inventory records.`,
      result,
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/seed" });
  }
}
