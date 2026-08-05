import mongoose from "mongoose";

export interface IPlanPricingOption {
  durationMonths: number;
  priceLabel: string;
}

export interface IPlan extends mongoose.Document {
  name: string;
  priceLabel: string;
  priceSuffix: string;
  description: string;
  features: string[];
  maxFileSizeBytes: number;
  maxProjectsPerUser: number;
  maxStorageBytes: number;
  maxMembersPerProject: number;
  // Duration+price options an admin can pick from when assigning this plan to a
  // user (e.g. 1mo/$10, 3mo/$27, 6mo/$50). Empty = the plan never expires when assigned
  // (used by the default/free plan).
  pricingOptions: IPlanPricingOption[];
  // Hidden plans don't appear on the public pricing page or in a user's own
  // "other plans" list, but an admin can still assign one to any user directly.
  isHidden: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new mongoose.Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    priceLabel: { type: String, default: "", trim: true },
    priceSuffix: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    features: { type: [String], default: [] },
    maxFileSizeBytes: { type: Number, required: true, min: 1 },
    maxProjectsPerUser: { type: Number, required: true, min: 1 },
    maxStorageBytes: { type: Number, required: true, min: 1 },
    maxMembersPerProject: { type: Number, required: true, min: 1 },
    pricingOptions: {
      type: [
        {
          durationMonths: { type: Number, required: true, min: 1 },
          priceLabel: { type: String, required: true, trim: true },
          _id: false,
        },
      ],
      default: [],
    },
    isHidden: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Plan = mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);

export default Plan;
