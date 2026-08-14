import type { Types } from "mongoose";
import type { Rand } from "@/seed/rng";
import { randomInt } from "@/seed/rng";

export interface ProductRef {
  _id: Types.ObjectId;
  sku: string;
}

export interface GeneratedInventory {
  productId: Types.ObjectId;
  sku: string;
  stock: { noon: number; amazon: number; shopify: number; warehouse: number };
  reorderLevel: number;
  reorderQuantity: number;
  lastSyncedAt: { noon: Date; amazon: Date; shopify: Date };
  hasMismatch: boolean;
  mismatchDetails: string | null;
}

/**
 * Generates one inventory record per product, seeding the specific
 * mismatch/low-stock/out-of-stock scenarios called out in the spec:
 *  - 5 products: Shopify stock > warehouse stock (overselling risk)
 *  - 3 products: warehouse has stock but Noon shows 0 (lost sales)
 *  - 8 products: below reorder level
 *  - 2 products: 0 stock everywhere (out of stock)
 */
export function generateInventory(rand: Rand, products: ProductRef[]): GeneratedInventory[] {
  const OVERSELL_COUNT = 5;
  const LOST_SALES_COUNT = 3;
  const LOW_STOCK_COUNT = 8;
  const OUT_OF_STOCK_COUNT = 2;

  const overselling = new Set(products.slice(0, OVERSELL_COUNT).map((p) => p.sku));
  const lostSales = new Set(
    products.slice(OVERSELL_COUNT, OVERSELL_COUNT + LOST_SALES_COUNT).map((p) => p.sku)
  );
  const lowStock = new Set(
    products
      .slice(OVERSELL_COUNT + LOST_SALES_COUNT, OVERSELL_COUNT + LOST_SALES_COUNT + LOW_STOCK_COUNT)
      .map((p) => p.sku)
  );
  const outOfStock = new Set(
    products
      .slice(
        OVERSELL_COUNT + LOST_SALES_COUNT + LOW_STOCK_COUNT,
        OVERSELL_COUNT + LOST_SALES_COUNT + LOW_STOCK_COUNT + OUT_OF_STOCK_COUNT
      )
      .map((p) => p.sku)
  );

  const now = () => new Date();
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  return products.map((product) => {
    const reorderLevel = randomInt(rand, 10, 30);
    const reorderQuantity = randomInt(rand, 50, 150);

    if (overselling.has(product.sku)) {
      const warehouse = randomInt(rand, 5, 15);
      const shopify = warehouse + randomInt(rand, 5, 20);
      return {
        productId: product._id,
        sku: product.sku,
        stock: { noon: randomInt(rand, 10, 40), amazon: randomInt(rand, 10, 40), shopify, warehouse },
        reorderLevel,
        reorderQuantity,
        lastSyncedAt: { noon: hoursAgo(2), amazon: hoursAgo(3), shopify: hoursAgo(48) },
        hasMismatch: true,
        mismatchDetails: `Shopify shows ${shopify} units but warehouse only has ${warehouse} — overselling risk.`,
      };
    }

    if (lostSales.has(product.sku)) {
      const warehouse = randomInt(rand, 20, 60);
      return {
        productId: product._id,
        sku: product.sku,
        stock: { noon: 0, amazon: randomInt(rand, 10, 40), shopify: randomInt(rand, 10, 40), warehouse },
        reorderLevel,
        reorderQuantity,
        lastSyncedAt: { noon: hoursAgo(72), amazon: hoursAgo(2), shopify: hoursAgo(2) },
        hasMismatch: true,
        mismatchDetails: `Warehouse has ${warehouse} units but Noon listing shows 0 — lost sales opportunity.`,
      };
    }

    if (lowStock.has(product.sku)) {
      const warehouse = randomInt(rand, 1, reorderLevel - 1);
      return {
        productId: product._id,
        sku: product.sku,
        stock: { noon: warehouse, amazon: warehouse, shopify: warehouse, warehouse },
        reorderLevel,
        reorderQuantity,
        lastSyncedAt: { noon: hoursAgo(4), amazon: hoursAgo(4), shopify: hoursAgo(4) },
        hasMismatch: false,
        mismatchDetails: null,
      };
    }

    if (outOfStock.has(product.sku)) {
      return {
        productId: product._id,
        sku: product.sku,
        stock: { noon: 0, amazon: 0, shopify: 0, warehouse: 0 },
        reorderLevel,
        reorderQuantity,
        lastSyncedAt: { noon: hoursAgo(6), amazon: hoursAgo(6), shopify: hoursAgo(6) },
        hasMismatch: false,
        mismatchDetails: null,
      };
    }

    // Normal, healthy stock — all channels roughly in sync with warehouse.
    const warehouse = randomInt(rand, reorderLevel + 20, reorderLevel + 200);
    const jitter = () => Math.max(0, warehouse - randomInt(rand, 0, 5));
    return {
      productId: product._id,
      sku: product.sku,
      stock: { noon: jitter(), amazon: jitter(), shopify: jitter(), warehouse },
      reorderLevel,
      reorderQuantity,
      lastSyncedAt: { noon: hoursAgo(1), amazon: hoursAgo(1), shopify: now() },
      hasMismatch: false,
      mismatchDetails: null,
    };
  });
}
