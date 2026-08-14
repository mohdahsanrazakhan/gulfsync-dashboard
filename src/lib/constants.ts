export const APP_NAME = "GulfSync";
export const APP_TAGLINE = "Unified e-commerce intelligence for Gulf sellers";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Baby & Kids",
  "Health & Wellness",
  "Books & Stationery",
  "Automotive",
  "Grocery & Gourmet",
] as const;

export const CHANNELS = ["noon", "amazon", "shopify"] as const;

export const CHANNEL_LABELS: Record<(typeof CHANNELS)[number], string> = {
  noon: "Noon",
  amazon: "Amazon.ae",
  shopify: "Shopify",
};

export const CHANNEL_COLORS: Record<(typeof CHANNELS)[number], string> = {
  noon: "#FEE600",
  amazon: "#FF9900",
  shopify: "#96BF48",
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
] as const;

export const PAYMENT_METHODS = [
  "cod",
  "credit_card",
  "debit_card",
  "mada",
  "apple_pay",
  "tabby",
  "tamara",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const CURRENCIES = ["SAR", "AED"] as const;

export const COUNTRIES = ["UAE", "KSA"] as const;

export const CITIES = [
  { name: "Dubai", country: "UAE" },
  { name: "Abu Dhabi", country: "UAE" },
  { name: "Sharjah", country: "UAE" },
  { name: "Ajman", country: "UAE" },
  { name: "RAK", country: "UAE" },
  { name: "Riyadh", country: "KSA" },
  { name: "Jeddah", country: "KSA" },
  { name: "Dammam", country: "KSA" },
  { name: "Makkah", country: "KSA" },
] as const;

export const DELIVERY_PARTNERS = ["aramex", "smsa", "fetchr", "jt_express", "dhl"] as const;

export const DELIVERY_PARTNER_LABELS: Record<(typeof DELIVERY_PARTNERS)[number], string> = {
  aramex: "Aramex",
  smsa: "SMSA",
  fetchr: "Fetchr",
  jt_express: "J&T Express",
  dhl: "DHL",
};

export const SHIPPING_STATUSES = [
  "pending_pickup",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed_delivery",
  "returned_to_sender",
] as const;

export const RETURN_REASONS = [
  "wrong_size",
  "damaged",
  "not_as_described",
  "changed_mind",
  "cod_rejected",
  "not_needed",
] as const;

export const REFUND_STATUSES = ["pending", "processed", "completed"] as const;

export const INSIGHT_TYPES = ["revenue", "cod", "returns", "inventory", "delivery", "product"] as const;

export const INSIGHT_SEVERITIES = ["info", "warning", "critical", "opportunity"] as const;

export const USER_ROLES = ["admin", "viewer"] as const;

export const DEMO_USER_EMAIL = "demo@gulfsync.com";
export const DEMO_USER_PASSWORD = "GulfSync@2026!";

export const AI_MAX_TOKENS = 1200;
export const AI_INPUT_MAX_LENGTH = 500;
export const AI_MODEL = "gpt-4o-mini";

export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
