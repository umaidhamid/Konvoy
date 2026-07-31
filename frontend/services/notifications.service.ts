import api from "@/lib/api";
import { Notification, Pagination } from "@/types/notification.types";

const baseUrl = "/notifications";

export const notificationsService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await api.get<{
      success: boolean;
      data: Notification[];
      unreadCount: number;
      pagination: Pagination;
    }>(baseUrl, { params: { page, limit, unreadOnly: unreadOnly || undefined } });
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
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`${baseUrl}/${notificationId}`);
    return response.data;
  },
  clearRead: async () => {
    const response = await api.delete<{ success: boolean; message: string }>(`${baseUrl}/read`);
    return response.data;
  },
};
