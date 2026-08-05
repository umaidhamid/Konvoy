import mongoose from "mongoose";

export interface IActivityLog extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: string;
  message: string;
  createdAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;
