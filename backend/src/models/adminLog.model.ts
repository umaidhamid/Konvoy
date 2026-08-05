import mongoose from "mongoose";

export interface IAdminLog extends mongoose.Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  targetType: "user" | "project" | "plan" | "broadcast" | "settings";
  targetId: mongoose.Types.ObjectId | string;
  details: string;
  createdAt: Date;
}

const adminLogSchema = new mongoose.Schema<IAdminLog>(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["user", "project", "plan", "broadcast", "settings"], required: true },
    targetId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    details: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const AdminLog =
  mongoose.models.AdminLog || mongoose.model<IAdminLog>("AdminLog", adminLogSchema);

export default AdminLog;
