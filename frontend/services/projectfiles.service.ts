// ============================================
// services/projectfiles.service.ts
// ============================================
import api from "@/lib/api";
import { ProjectFile, Project } from "@/types/projectfile.types";

const baseUrl = "/projectfile";

const getBasename = (input: string) => input.split("/").pop() || input;

export const projectfilesService = {
  getProjectFiles: async (slug: string) => {
    const response = await api.get<{ project: Project; files: ProjectFile[] }>(
      `${baseUrl}/${slug}`
    );
    return response.data;
  },

  createProjectFile: async (slug: string, inputValue: string, content: string = "") => {
    const response = await api.post<ProjectFile>(`${baseUrl}/${slug}`, {
      name: getBasename(inputValue),
      path: inputValue,
      content,
    });
    return response.data;
  },

  getProjectFileById: async (id: string) => {
    const response = await api.get<ProjectFile>(`${baseUrl}/single/${id}`);
    return response.data;
  },

  updateProjectFile: async (id: string, content: string) => {
    const response = await api.put<ProjectFile>(`${baseUrl}/${id}`, { content });
    return response.data;
  },

  renameProjectFile: async (id: string, name: string) => {
    const response = await api.put<ProjectFile>(`${baseUrl}/${id}`, { name });
    return response.data;
  },

  deleteProjectFile: async (id: string) => {
    const response = await api.delete<{ message: string }>(`${baseUrl}/${id}`);
    return response.data;
  },
};