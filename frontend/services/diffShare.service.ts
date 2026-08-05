import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { CreatedDiffShare, MyDiffShare, DiffShareContent } from "@/types/diffShare.types";

const baseUrl = "/diff-shares";

export const diffShareService = {
  createDiffShare: async (
    leftContent: string,
    rightContent: string,
    expiresInMinutes: number,
    maxViews: number | null,
    title?: string,
    leftLabel?: string,
    rightLabel?: string,
    language?: string
  ) => {
    const response = await api.post<ApiResponse<CreatedDiffShare>>(baseUrl, {
      leftContent,
      rightContent,
      expiresInMinutes,
      maxViews,
      title: title || undefined,
      leftLabel: leftLabel || undefined,
      rightLabel: rightLabel || undefined,
      language: language || undefined,
    });
    return response.data;
  },
  listMyDiffShares: async () => {
    const response = await api.get<ApiResponse<MyDiffShare[]>>(`${baseUrl}/mine`);
    return response.data;
  },
  deleteDiffShare: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`${baseUrl}/${id}`);
    return response.data;
  },
  getDiffShare: async (token: string) => {
    const response = await api.get<ApiResponse<DiffShareContent>>(`${baseUrl}/${token}`);
    return response.data;
  },
};
