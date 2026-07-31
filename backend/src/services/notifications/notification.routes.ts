import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteReadNotifications,
} from "./notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.patch("/read-all", authMiddleware, markAllNotificationsRead);
notificationRouter.patch("/:notificationId/read", authMiddleware, markNotificationRead);
notificationRouter.delete("/read", authMiddleware, deleteReadNotifications);
notificationRouter.delete("/:notificationId", authMiddleware, deleteNotification);

export default notificationRouter;
