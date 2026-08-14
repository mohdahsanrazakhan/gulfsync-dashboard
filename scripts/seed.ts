/**
 * CLI seed runner.
 * Usage: npx tsx scripts/seed.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import { runSeed } from "@/seed/seed";

async function main() {
  const start = Date.now();
  try {
    const result = await runSeed(console.log);
    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    console.log(
      `\nSeed complete in ${seconds}s — ${result.users} user(s), ${result.products} products, ${result.orders} orders, ${result.inventory} inventory records, ${result.insights} insights.`
    );
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
