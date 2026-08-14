import { z } from "zod";
import {
  CHANNELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_PARTNERS,
  PRODUCT_CATEGORIES,
  CURRENCIES,
  MAX_PAGE_SIZE,
  AI_INPUT_MAX_LENGTH,
} from "@/lib/constants";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ID format");

export const searchQuerySchema = z
  .string()
  .max(100, "Search query too long")
  .transform((s) => s.replace(/<[^>]*>/g, "").trim())
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(25),
});

const isoDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" });

export const dateRangeSchema = z
  .object({
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
  })
  .refine(
    (v) => !v.startDate || !v.endDate || new Date(v.startDate) <= new Date(v.endDate),
    { message: "startDate must be before endDate", path: ["startDate"] }
  );

export const periodSchema = z.enum(["7d", "30d", "90d", "12m", "custom"]).default("30d");

export const currencySchema = z.enum(CURRENCIES).default("SAR");

export const dashboardStatsQuerySchema = z.object({
  period: periodSchema,
  currency: currencySchema,
});

export const ordersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().max(100000).default(1),
    limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(25),
    channel: z.enum(["all", ...CHANNELS]).default("all"),
    status: z.enum(["all", ...ORDER_STATUSES]).default("all"),
    payment: z.enum(["all", ...PAYMENT_METHODS]).default("all"),
    city: z.string().max(100).optional(),
    partner: z.enum(["all", ...DELIVERY_PARTNERS]).default("all"),
    search: searchQuerySchema,
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
    sort: z.enum(["createdAt", "totalAmount", "orderId"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (v) => !v.startDate || !v.endDate || new Date(v.startDate) <= new Date(v.endDate),
    { message: "startDate must be before endDate", path: ["startDate"] }
  );

export const inventoryQuerySchema = z.object({
  status: z.enum(["all", "in_stock", "low_stock", "out_of_stock", "mismatch"]).default("all"),
  category: z.enum(["all", ...PRODUCT_CATEGORIES]).default("all"),
  search: searchQuerySchema,
  page: z.coerce.number().int().positive().max(100000).default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(25),
});

export const analyticsQuerySchema = z.object({
  period: periodSchema,
  type: z.enum(["revenue", "payment", "returns", "delivery", "products"]),
});

export const insightsQuerySchema = z.object({
  filter: z.enum(["all", "unread"]).default("all"),
});

const aiText = (max = AI_INPUT_MAX_LENGTH) =>
  z
    .string()
    .max(max)
    .transform((s) => s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim());

export const aiContentSchema = z.object({
  productName: aiText(200).pipe(z.string().min(1, "Product name is required")),
  features: aiText(500).default(""),
  audience: aiText(200).default(""),
  priceRange: aiText(100).default(""),
  tone: z.enum(["professional", "casual", "luxury", "promotional"]).default("professional"),
  language: z.enum(["en", "ar", "both"]).default("both"),
  platform: z.enum(["noon", "amazon", "shopify", "all"]).default("all"),
  keywords: z.array(aiText(60)).max(20).default([]),
  productId: objectIdSchema.optional(),
});

export const insightIdParamSchema = z.object({
  id: objectIdSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});
