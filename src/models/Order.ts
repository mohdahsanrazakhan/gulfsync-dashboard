import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import {
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
} from "@/lib/constants";

export interface IOrder extends Document {
  orderId: string;
  channel: (typeof CHANNELS)[number];
  status: (typeof ORDER_STATUSES)[number];
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: (typeof COUNTRIES)[number];
    address: string;
  };
  items: {
    productId: Types.ObjectId;
    sku: string;
    nameEn: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  payment: {
    method: (typeof PAYMENT_METHODS)[number];
    status: (typeof PAYMENT_STATUSES)[number];
    currency: (typeof CURRENCIES)[number];
    subtotal: number;
    shippingCost: number;
    vatAmount: number;
    discount: number;
    totalAmount: number;
    codAmount: number | null;
  };
  shipping: {
    partner: (typeof DELIVERY_PARTNERS)[number];
    trackingNumber: string;
    estimatedDelivery: Date;
    actualDelivery: Date | null;
    deliveryAttempts: number;
    status: (typeof SHIPPING_STATUSES)[number];
  };
  return: {
    isReturned: boolean;
    returnReason: (typeof RETURN_REASONS)[number] | null;
    returnDate: Date | null;
    refundAmount: number | null;
    refundStatus: (typeof REFUND_STATUSES)[number] | null;
  };
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    nameEn: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: CHANNELS, required: true, index: true },
    status: { type: String, enum: ORDER_STATUSES, required: true, index: true },

    customer: {
      name: { type: String, required: true, trim: true, maxlength: 150 },
      email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
      phone: { type: String, required: true, trim: true, maxlength: 30 },
      city: { type: String, required: true, index: true, trim: true, maxlength: 100 },
      country: { type: String, enum: COUNTRIES, required: true },
      address: { type: String, required: true, maxlength: 400 },
    },

    items: { type: [OrderItemSchema], required: true, validate: (v: unknown[]) => Array.isArray(v) && v.length > 0 },

    payment: {
      method: { type: String, enum: PAYMENT_METHODS, required: true, index: true },
      status: { type: String, enum: PAYMENT_STATUSES, required: true },
      currency: { type: String, enum: CURRENCIES, required: true },
      subtotal: { type: Number, required: true, min: 0 },
      shippingCost: { type: Number, required: true, min: 0 },
      vatAmount: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0, default: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      codAmount: { type: Number, default: null },
    },

    shipping: {
      partner: { type: String, enum: DELIVERY_PARTNERS, required: true, index: true },
      trackingNumber: { type: String, required: true },
      estimatedDelivery: { type: Date, required: true },
      actualDelivery: { type: Date, default: null },
      deliveryAttempts: { type: Number, default: 0, min: 0 },
      status: { type: String, enum: SHIPPING_STATUSES, required: true },
    },

    return: {
      isReturned: { type: Boolean, default: false },
      returnReason: { type: String, enum: [...RETURN_REASONS, null], default: null },
      returnDate: { type: Date, default: null },
      refundAmount: { type: Number, default: null },
      refundStatus: { type: String, enum: [...REFUND_STATUSES, null], default: null },
    },

    notes: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.city": 1, createdAt: -1 });
OrderSchema.index({ channel: 1, status: 1 });
OrderSchema.index({ "customer.name": "text", orderId: "text", "items.sku": "text" });

const Order: Model<IOrder> = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
