import mongoose from "mongoose";

export interface ISecret extends mongoose.Document {
  token: string;
  content: string;
  label: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  maxViews: number | null; // null = unlimited (bounded only by expiresAt)
  viewCount: number;
  viewLog: Date[]; // most recent views first, capped
  viewedAt: Date | null; // most recent view, kept for quick display
  isRevoked: boolean;
  requireAuth: boolean;
  hasPassphrase: boolean;
  passphraseHash: string | null;
  failedAttempts: number;
  createdAt: Date;
}

const MAX_PASSPHRASE_ATTEMPTS = 5;
const MAX_VIEW_LOG_ENTRIES = 20;

const secretSchema = new mongoose.Schema<ISecret>(
  {
    token: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    label: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    maxViews: { type: Number, default: 1 },
    viewCount: { type: Number, default: 0 },
    viewLog: { type: [Date], default: [] },
    viewedAt: { type: Date, default: null },
    isRevoked: { type: Boolean, default: false },
    requireAuth: { type: Boolean, default: false },
    hasPassphrase: { type: Boolean, default: false },
    passphraseHash: { type: String, default: null, select: false },
    failedAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const Secret = mongoose.models.Secret || mongoose.model<ISecret>("Secret", secretSchema);

export { MAX_PASSPHRASE_ATTEMPTS, MAX_VIEW_LOG_ENTRIES };
export default Secret;
