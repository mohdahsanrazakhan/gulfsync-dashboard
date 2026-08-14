import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Insight from "@/models/Insight";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "@/lib/constants";
import { mulberry32 } from "@/seed/rng";
import { generateProducts } from "@/seed/generators/products";
import { generateInventory } from "@/seed/generators/inventory";
import { generateOrders } from "@/seed/generators/orders";
import insightsData from "@/seed/data/insights.json";

const SEED = 20260101;

export interface SeedResult {
  users: number;
  products: number;
  orders: number;
  inventory: number;
  insights: number;
}

export async function runSeed(log: (msg: string) => void = console.log): Promise<SeedResult> {
  const rand = mulberry32(SEED);

  await connectDB();
  log("Connected to MongoDB.");

  log("Dropping existing collections (users, products, orders, inventory, insights)...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Inventory.deleteMany({}),
    Insight.deleteMany({}),
  ]);

  log("Creating demo user...");
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  await User.create({
    name: "Demo User",
    email: DEMO_USER_EMAIL,
    passwordHash,
    role: "admin",
    company: "NoonCart Trading LLC",
  });

  log("Generating 85 products...");
  const productDocs = generateProducts(rand);
  const insertedProducts = await Product.insertMany(productDocs, { ordered: true });
  log(`  -> inserted ${insertedProducts.length} products.`);

  log("Generating inventory records (with seeded mismatch scenarios)...");
  const productRefs = insertedProducts.map((p) => ({ _id: p._id as mongoose.Types.ObjectId, sku: p.sku }));
  const inventoryDocs = generateInventory(rand, productRefs);
  const insertedInventory = await Inventory.insertMany(inventoryDocs, { ordered: true });
  log(`  -> inserted ${insertedInventory.length} inventory records.`);

  log("Generating 5,000 orders across the last 12 months...");
  const orderProductRefs = insertedProducts.map((p) => ({
    _id: p._id as mongoose.Types.ObjectId,
    sku: p.sku,
    nameEn: p.nameEn,
    sellingPrice: p.sellingPrice,
  }));
  const orderDocs = generateOrders(rand, orderProductRefs, 5000, 12);

  // Insert in batches to avoid overwhelming a single insertMany call.
  const BATCH_SIZE = 500;
  let insertedOrderCount = 0;
  for (let i = 0; i < orderDocs.length; i += BATCH_SIZE) {
    const batch = orderDocs.slice(i, i + BATCH_SIZE);
    await Order.insertMany(batch, { ordered: false });
    insertedOrderCount += batch.length;
    log(`  -> inserted ${insertedOrderCount}/${orderDocs.length} orders...`);
  }

  log("Inserting 15 pre-written AI insights...");
  const insertedInsights = await Insight.insertMany(
    insightsData.map((i) => ({ ...i, isRead: false })),
    { ordered: true }
  );
  log(`  -> inserted ${insertedInsights.length} insights.`);

  return {
    users: 1,
    products: insertedProducts.length,
    orders: insertedOrderCount,
    inventory: insertedInventory.length,
    insights: insertedInsights.length,
  };
}
