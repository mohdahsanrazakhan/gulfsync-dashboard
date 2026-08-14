import { Schema, model, models, type Model, type Document } from "mongoose";
import { INSIGHT_TYPES, INSIGHT_SEVERITIES } from "@/lib/constants";

export interface IInsight extends Document {
  type: (typeof INSIGHT_TYPES)[number];
  severity: (typeof INSIGHT_SEVERITIES)[number];
  title: string;
  description: string;
  metric: string;
  recommendation: string;
  dataPoints: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    type: { type: String, enum: INSIGHT_TYPES, required: true, index: true },
    severity: { type: String, enum: INSIGHT_SEVERITIES, required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    metric: { type: String, required: true, maxlength: 200 },
    recommendation: { type: String, required: true, maxlength: 1000 },
    dataPoints: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Insight: Model<IInsight> = models.Insight || model<IInsight>("Insight", InsightSchema);

export default Insight;
