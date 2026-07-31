import mongoose from "mongoose";

export type NotificationType =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "member_added"
  | "member_added_you"
  | "member_removed"
  | "member_removed_you"
  | "member_left"
  | "account_deactivated"
  | "account_reactivated"
  | "role_changed"
  | "plan_changed"
  | "secret_viewed"
  | "announcement";

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  projectId?: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
