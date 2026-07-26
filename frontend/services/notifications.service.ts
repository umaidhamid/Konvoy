import api from "@/lib/api";
import { Notification } from "@/types/notification.types";

const baseUrl = "/notifications";

export const notificationsService = {
  getNotifications: async () => {
    const response = await api.get<{ success: boolean; data: Notification[]; unreadCount: number }>(baseUrl);
    return response.data;
  },
  markRead: async (notificationId: string) => {
    const response = await api.patch<{ success: boolean; data: Notification }>(`${baseUrl}/${notificationId}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.patch<{ success: boolean; message: string }>(`${baseUrl}/read-all`);
    return response.data;
  },
};
