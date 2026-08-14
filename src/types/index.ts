import type {
  CHANNELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  CURRENCIES,
  COUNTRIES,
  DELIVERY_PARTNERS,
  SHIPPING_STATUSES,
  RETURN_REASONS,
  REFUND_STATUSES,
  INSIGHT_TYPES,
  INSIGHT_SEVERITIES,
  USER_ROLES,
} from "@/lib/constants";

export type Channel = (typeof CHANNELS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type Country = (typeof COUNTRIES)[number];
export type DeliveryPartner = (typeof DELIVERY_PARTNERS)[number];
export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];
export type ReturnReason = (typeof RETURN_REASONS)[number];
export type RefundStatus = (typeof REFUND_STATUSES)[number];
export type InsightType = (typeof INSIGHT_TYPES)[number];
export type InsightSeverity = (typeof INSIGHT_SEVERITIES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChannelListing {
  listed: boolean;
  noonSku?: string;
  asin?: string;
  shopifyId?: string;
  price: number;
}

export interface Product {
  _id: string;
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
    noon: ChannelListing;
    amazon: ChannelListing;
    shopify: ChannelListing;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderId: string;
  channel: Channel;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: Country;
    address: string;
  };
  items: OrderItem[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    currency: Currency;
    subtotal: number;
    shippingCost: number;
    vatAmount: number;
    discount: number;
    totalAmount: number;
    codAmount: number | null;
  };
  shipping: {
    partner: DeliveryPartner;
    trackingNumber: string;
    estimatedDelivery: string;
    actualDelivery: string | null;
    deliveryAttempts: number;
    status: ShippingStatus;
  };
  return: {
    isReturned: boolean;
    returnReason: ReturnReason | null;
    returnDate: string | null;
    refundAmount: number | null;
    refundStatus: RefundStatus | null;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  _id: string;
  productId: string;
  sku: string;
  stock: {
    noon: number;
    amazon: number;
    shopify: number;
    warehouse: number;
  };
  reorderLevel: number;
  reorderQuantity: number;
  lastSyncedAt: {
    noon: string;
    amazon: string;
    shopify: string;
  };
  hasMismatch: boolean;
  mismatchDetails: string | null;
  updatedAt: string;
}

export interface Insight {
  _id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metric: string;
  recommendation: string;
  dataPoints: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  revenue: { current: number; previous: number; changePercent: number; sparkline: number[] };
  orders: { current: number; previous: number; changePercent: number; sparkline: number[] };
  codRate: { current: number; previous: number; changePercent: number };
  returnRate: { current: number; previous: number; changePercent: number };
  revenueByChannel: { noon: number; amazon: number; shopify: number };
  revenueByDay: { date: string; noon: number; amazon: number; shopify: number }[];
  recentOrders: Order[];
  topProducts: { product: Product; unitsSold: number; revenue: number }[];
  codByCity: { city: string; rate: number; total: number }[];
  alerts: { lowStock: number; mismatches: number; unreadInsights: number };
}
