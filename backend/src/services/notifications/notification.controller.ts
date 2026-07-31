import Notification from "../../models/notification.model.js";

const parsePagination = (req: any) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const unreadOnly = req.query.unreadOnly === "true";
  return { page, limit, unreadOnly };
};

// GET /notifications?page=&limit=&unreadOnly=
export const getNotifications = async (req: any, res: any) => {
  try {
    const { page, limit, unreadOnly } = parsePagination(req);
    const filter: any = { userId: req.user.userId };
    if (unreadOnly) filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("projectId", "name slug")
        .populate("actorId", "fullname email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.userId, read: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const markNotificationRead = async (req: any, res: any) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const markAllNotificationsRead = async (req: any, res: any) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /notifications/:notificationId
export const deleteNotification = async (req: any, res: any) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /notifications/read - clears every already-read notification
export const deleteReadNotifications = async (req: any, res: any) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.userId, read: true });

    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} notification(s).`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
