import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { EnvDriftResult } from "@/types/envDrift.types";

const baseUrl = "/env-drift";

export const envDriftService = {
  compare: async (fileIdA: string, fileIdB: string, reveal: boolean) => {
    const response = await api.get<ApiResponse<EnvDriftResult>>(`${baseUrl}/compare`, {
      params: { fileIdA, fileIdB, reveal: reveal || undefined },
    });
    return response.data;
  },
};
