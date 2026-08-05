import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDiffShare extends Document {
  token: string;
  createdBy: Types.ObjectId;
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftContent: string;
  rightContent: string;
  language: string;
  viewCount: number;
  // null = unlimited (bounded only by expiresAt), matching Secret's maxViews.
  maxViews: number | null;
  createdAt: Date;
  expiresAt: Date;
}

const diffShareSchema = new Schema<IDiffShare>(
  {
    token: { type: String, required: true, unique: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "", trim: true },
    leftLabel: { type: String, default: "Original", trim: true },
    rightLabel: { type: String, default: "Modified", trim: true },
    leftContent: { type: String, default: "" },
    rightContent: { type: String, default: "" },
    language: { type: String, default: "plaintext" },
    viewCount: { type: Number, default: 0 },
    maxViews: { type: Number, default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IDiffShare>("DiffShare", diffShareSchema);
