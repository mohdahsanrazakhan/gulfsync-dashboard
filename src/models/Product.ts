import { Schema, model, models, type Model, type Document } from "mongoose";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export interface IProduct extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ChannelListingSchema = new Schema(
  {
    listed: { type: Boolean, default: false },
    noonSku: { type: String, default: "" },
    asin: { type: String, default: "" },
    shopifyId: { type: String, default: "" },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, index: true, trim: true },
    nameEn: { type: String, required: true, trim: true, maxlength: 200 },
    nameAr: { type: String, required: true, trim: true, maxlength: 200 },
    descriptionEn: { type: String, required: true, maxlength: 4000 },
    descriptionAr: { type: String, required: true, maxlength: 4000 },
    category: { type: String, required: true, enum: PRODUCT_CATEGORIES, index: true },
    subcategory: { type: String, required: true, trim: true, maxlength: 100 },
    brand: { type: String, required: true, trim: true, maxlength: 100 },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    channels: {
      noon: { type: ChannelListingSchema, default: () => ({}) },
      amazon: { type: ChannelListingSchema, default: () => ({}) },
      shopify: { type: ChannelListingSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

ProductSchema.index({ nameEn: "text", sku: "text" });

const Product: Model<IProduct> = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
