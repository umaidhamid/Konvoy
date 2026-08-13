import api from "@/lib/api";
import { ActivityEntry, Pagination } from "@/types/activity.types";

const baseUrl = "/projects";

export const activityService = {
  getProjectActivity: async (projectId: string, page = 1, limit = 20) => {
    const response = await api.get<{
      success: boolean;
      data: ActivityEntry[];
      pagination: Pagination;
    }>(`${baseUrl}/${projectId}/activity`, { params: { page, limit } });
    return response.data;
  },
};
