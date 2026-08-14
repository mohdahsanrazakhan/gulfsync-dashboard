import { Schema, model, models, type Model, type Document, type Types } from "mongoose";

export interface IInventory extends Document {
  productId: Types.ObjectId;
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
    noon: Date;
    amazon: Date;
    shopify: Date;
  };
  hasMismatch: boolean;
  mismatchDetails: string | null;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, index: true },

    stock: {
      noon: { type: Number, required: true, min: 0, default: 0 },
      amazon: { type: Number, required: true, min: 0, default: 0 },
      shopify: { type: Number, required: true, min: 0, default: 0 },
      warehouse: { type: Number, required: true, min: 0, default: 0 },
    },

    reorderLevel: { type: Number, required: true, min: 0, default: 10 },
    reorderQuantity: { type: Number, required: true, min: 0, default: 50 },

    lastSyncedAt: {
      noon: { type: Date, default: () => new Date() },
      amazon: { type: Date, default: () => new Date() },
      shopify: { type: Date, default: () => new Date() },
    },

    hasMismatch: { type: Boolean, default: false, index: true },
    mismatchDetails: { type: String, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const Inventory: Model<IInventory> =
  models.Inventory || model<IInventory>("Inventory", InventorySchema);

export default Inventory;
