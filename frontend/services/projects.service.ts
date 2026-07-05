// services/projects.service.ts
import api from "@/lib/api";
import { Project, ApiResponse } from "@/types/project.types";

const baseUrl = "/projects";

export const projectsService = {
  createProject: async (name: string, description: string) => {
    const response = await api.post<ApiResponse<Project>>(`${baseUrl}/create`, { name, description });
    return response.data;
  },
  getProjects: async () => {
    const response = await api.get<ApiResponse<Project[]>>(`${baseUrl}/users-projects`);
    return response.data;
  },
  deleteProject: async (projectId: string) => {
    const response = await api.delete<ApiResponse<{ name: string }>>(`${baseUrl}/delete/${projectId}`);
    return response.data;
  },
  getProject: async (projectId: string) => {
    const response = await api.get<ApiResponse<Project>>(`${baseUrl}/project/${projectId}`);
    return response.data;
  },
  updateProject: async (projectId: string, name: string, description: string) => {
    const response = await api.put<ApiResponse<Project>>(`${baseUrl}/update/${projectId}`, { name, description });
    return response.data;
  },
};