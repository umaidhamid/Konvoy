import mongoose from "mongoose";

export const ACTIVITY_ACTIONS = [
  "project_created",
  "project_updated",
  "member_added",
  "member_removed",
  "member_left",
  "file_created",
  "file_renamed",
  "file_deleted",
  "file_version_restored",
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export interface IActivityLog extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: ActivityAction;
  message: string;
  createdAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
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

// Auto-expire entries 90 days after creation so the feed doesn't grow unbounded.
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;
