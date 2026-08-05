import mongoose from "mongoose";

// Singleton document (always _id: "global") for admin-tunable knobs that don't
// deserve their own collection - avoids redeploying to change a number.
export interface IAppSettings extends Omit<mongoose.Document, "_id"> {
  _id: string;
  referralRewardBytes: number;
  updatedAt: Date;
}

const appSettingsSchema = new mongoose.Schema<IAppSettings>(
  {
    _id: { type: String, default: "global" },
    referralRewardBytes: { type: Number, default: 500 * 1024 * 1024, min: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false }
);

const AppSettings = mongoose.models.AppSettings || mongoose.model<IAppSettings>("AppSettings", appSettingsSchema);

export default AppSettings;
