import Notification, { NotificationType } from "../../models/notification.model.js";

export const notify = async (
  userId: string,
  type: NotificationType,
  message: string,
  meta?: { projectId?: string; actorId?: string }
) => {
  try {
    await Notification.create({
      userId,
      type,
      message,
      projectId: meta?.projectId,
      actorId: meta?.actorId,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};
