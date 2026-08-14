import type { Rand } from "@/seed/rng";
import { randomInt, randomFloat, shuffle } from "@/seed/rng";
import rawProducts from "@/seed/data/products.json";

const CATEGORY_CODES: Record<string, string> = {
  "Electronics": "ELEC",
  "Fashion & Apparel": "FASH",
  "Beauty & Personal Care": "BEAU",
  "Home & Kitchen": "HOME",
  "Sports & Outdoors": "SPRT",
  "Baby & Kids": "BABY",
  "Health & Wellness": "HLTH",
  "Books & Stationery": "BOOK",
  "Automotive": "AUTO",
  "Grocery & Gourmet": "GROC",
};

const CHANNEL_KEYS = ["noon", "amazon", "shopify"] as const;

export interface GeneratedProduct {
  sku: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  subcategory: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  weight: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  channels: {
    noon: { listed: boolean; noonSku: string; price: number };
    amazon: { listed: boolean; asin: string; price: number };
    shopify: { listed: boolean; shopifyId: string; price: number };
  };
}

function buildDescriptionEn(nameEn: string, brand: string, category: string): string {
  return `The ${nameEn} by ${brand} is a top-selling pick in our ${category} lineup, trusted by shoppers across the UAE and Saudi Arabia. Built for everyday reliability with premium materials and quality control that meets Gulf market standards. Fast local delivery and easy returns included. Backed by ${brand}'s quality guarantee and responsive customer support.`;
}

function buildDescriptionAr(nameAr: string, brand: string): string {
  return `${nameAr} من ${brand} هو من أفضل المنتجات مبيعاً، موثوق من قبل المتسوقين في الإمارات والسعودية. مصنوع بجودة عالية ومواد ممتازة تلبي معايير السوق الخليجي. توصيل سريع محلي وإمكانية إرجاع سهلة. مدعوم بضمان الجودة من ${brand} وخدمة عملاء متجاوبة.`;
}

export function generateProducts(rand: Rand): GeneratedProduct[] {
  const counters: Record<string, number> = {};

  return rawProducts.map((raw) => {
    const code = CATEGORY_CODES[raw.category] ?? "MISC";
    counters[code] = (counters[code] ?? 0) + 1;
    const sku = `GS-${code}-${String(counters[code]).padStart(3, "0")}`;

    const sellingPrice = randomFloat(rand, 25, 2500);
    const costPrice = randomFloat(rand, sellingPrice * 0.45, sellingPrice * 0.7);
    const weight = randomInt(rand, 50, 5000);

    // List on 2-3 of the 3 channels, price varies +/-10% per channel.
    const numChannels = randomInt(rand, 2, 3);
    const chosenChannels = shuffle(rand, CHANNEL_KEYS).slice(0, numChannels);

    const channels = {
      noon: { listed: false, noonSku: "", price: 0 },
      amazon: { listed: false, asin: "", price: 0 },
      shopify: { listed: false, shopifyId: "", price: 0 },
    };

    for (const ch of chosenChannels) {
      const variance = randomFloat(rand, -0.1, 0.1);
      const price = Math.round(sellingPrice * (1 + variance) * 100) / 100;
      if (ch === "noon") {
        channels.noon = { listed: true, noonSku: `NN-${sku}`, price };
      } else if (ch === "amazon") {
        channels.amazon = { listed: true, asin: `B0${randomInt(rand, 10000000, 99999999)}`, price };
      } else {
        channels.shopify = { listed: true, shopifyId: `${randomInt(rand, 1000000, 9999999)}`, price };
      }
    }

    return {
      sku,
      nameEn: raw.nameEn,
      nameAr: raw.nameAr,
      descriptionEn: buildDescriptionEn(raw.nameEn, raw.brand, raw.category),
      descriptionAr: buildDescriptionAr(raw.nameAr, raw.brand),
      category: raw.category,
      subcategory: raw.subcategory,
      brand: raw.brand,
      costPrice,
      sellingPrice,
      weight,
      images: [`https://picsum.photos/seed/${sku}/600/600`],
      tags: [raw.category.split(" ")[0].toLowerCase(), raw.brand.toLowerCase().replace(/\s+/g, "-"), raw.subcategory.toLowerCase().replace(/\s+/g, "-")],
      isActive: true,
      channels,
    };
  });
}
