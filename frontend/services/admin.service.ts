import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { AdminUser, AdminProject, AdminLog, AdminStats, Pagination } from "@/types/admin.types";

const baseUrl = "/admin";

type Paginated<T> = ApiResponse<T> & { pagination: Pagination };

export const adminService = {
  getStats: async () => {
    const response = await api.get<ApiResponse<AdminStats>>(`${baseUrl}/stats`);
    return response.data;
  },
  getAllUsers: async (page = 1, limit = 20, search = "") => {
    const response = await api.get<Paginated<AdminUser[]>>(`${baseUrl}/users`, {
      params: { page, limit, search: search || undefined },
    });
    return response.data;
  },
  setUserDeactivation: async (userId: string, deactivated: boolean, note?: string) => {
    const response = await api.patch<ApiResponse<AdminUser>>(`${baseUrl}/users/${userId}/deactivate`, {
      deactivated,
      note,
    });
    return response.data;
  },
  bulkSetUserDeactivation: async (userIds: string[], deactivated: boolean, note?: string) => {
    const response = await api.patch<ApiResponse<null>>(`${baseUrl}/users/bulk-deactivate`, {
      userIds,
      deactivated,
      note,
    });
    return response.data;
  },
  setUserRole: async (userId: string, role: "user" | "admin" | "moderator") => {
    const response = await api.patch<ApiResponse<AdminUser>>(`${baseUrl}/users/${userId}/role`, { role });
    return response.data;
  },
  getAllProjects: async (page = 1, limit = 20, search = "") => {
    const response = await api.get<Paginated<AdminProject[]>>(`${baseUrl}/projects`, {
      params: { page, limit, search: search || undefined },
    });
    return response.data;
  },
  deleteProject: async (projectId: string) => {
    const response = await api.delete<ApiResponse<null>>(`${baseUrl}/projects/${projectId}`);
    return response.data;
  },
  bulkDeleteProjects: async (projectIds: string[]) => {
    const response = await api.delete<ApiResponse<null>>(`${baseUrl}/projects/bulk`, {
      data: { projectIds },
    });
    return response.data;
  },
  getLogs: async () => {
    const response = await api.get<ApiResponse<AdminLog[]>>(`${baseUrl}/logs`);
    return response.data;
  },
  usersExportUrl: (search = "") => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return `${base}${baseUrl}/users/export${q}`;
  },
  projectsExportUrl: (search = "") => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return `${base}${baseUrl}/projects/export${q}`;
  },
};
