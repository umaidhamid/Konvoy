import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { AwsPushResult } from "@/types/awsPush.types";

const baseUrl = "/aws-push";

export const awsPushService = {
  pushToParameterStore: async (params: {
    fileId: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    prefix: string;
    overwrite: boolean;
    secure: boolean;
  }) => {
    const response = await api.post<ApiResponse<AwsPushResult>>(`${baseUrl}/ssm`, params);
    return response.data;
  },
};
