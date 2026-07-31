import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { FeatureRequest, FeatureRequestStatus } from "@/types/featureRequest.types";

const baseUrl = "/feature-requests";

export const featureRequestService = {
  list: async (status?: FeatureRequestStatus | "all") => {
    const response = await api.get<ApiResponse<FeatureRequest[]>>(baseUrl, {
      params: { status: status && status !== "all" ? status : undefined },
    });
    return response.data;
  },
  create: async (title: string, description: string) => {
    const response = await api.post<ApiResponse<FeatureRequest>>(baseUrl, { title, description });
    return response.data;
  },
  toggleVote: async (id: string) => {
    const response = await api.post<ApiResponse<FeatureRequest>>(`${baseUrl}/${id}/vote`);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`${baseUrl}/${id}`);
    return response.data;
  },
  setStatus: async (id: string, status: FeatureRequestStatus) => {
    const response = await api.patch<ApiResponse<FeatureRequest>>(`${baseUrl}/${id}/status`, { status });
    return response.data;
  },
};
