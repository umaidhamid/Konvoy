import mongoose from "mongoose";

export type FeatureRequestStatus = "open" | "planned" | "in-progress" | "done" | "declined";

export interface IFeatureRequest extends mongoose.Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  status: FeatureRequestStatus;
  votes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const featureRequestSchema = new mongoose.Schema<IFeatureRequest>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["open", "planned", "in-progress", "done", "declined"],
      default: "open",
    },
    votes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const FeatureRequest =
  mongoose.models.FeatureRequest || mongoose.model<IFeatureRequest>("FeatureRequest", featureRequestSchema);

export default FeatureRequest;
