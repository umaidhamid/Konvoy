import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { CreatedSecret, MySecret, SecretPeek, RevealedSecret } from "@/types/secret.types";

const baseUrl = "/secrets";

export const secretService = {
  createSecret: async (
    content: string,
    expiresInMinutes: number,
    maxViews: number | null,
    label?: string,
    passphrase?: string,
    requireAuth?: boolean
  ) => {
    const response = await api.post<ApiResponse<CreatedSecret>>(baseUrl, {
      content,
      expiresInMinutes,
      maxViews,
      label: label || undefined,
      passphrase: passphrase || undefined,
      requireAuth: requireAuth || undefined,
    });
    return response.data;
  },
  recreateSecret: async (id: string, expiresInMinutes: number, maxViews: number | null) => {
    const response = await api.post<ApiResponse<CreatedSecret>>(`${baseUrl}/${id}/recreate`, {
      expiresInMinutes,
      maxViews,
    });
    return response.data;
  },
  extendSecret: async (id: string, addMinutes: number) => {
    const response = await api.patch<ApiResponse<MySecret>>(`${baseUrl}/${id}/extend`, { addMinutes });
    return response.data;
  },
  listMySecrets: async () => {
    const response = await api.get<ApiResponse<MySecret[]>>(`${baseUrl}/mine`);
    return response.data;
  },
  revokeSecret: async (id: string) => {
    const response = await api.delete<ApiResponse<MySecret>>(`${baseUrl}/${id}`);
    return response.data;
  },
  deleteSecretHistory: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`${baseUrl}/${id}/history`);
    return response.data;
  },
  peekSecret: async (token: string) => {
    const response = await api.get<ApiResponse<SecretPeek>>(`${baseUrl}/peek/${token}`);
    return response.data;
  },
  revealSecret: async (token: string, passphrase?: string) => {
    const response = await api.post<ApiResponse<RevealedSecret>>(`${baseUrl}/reveal/${token}`, {
      passphrase: passphrase || undefined,
    });
    return response.data;
  },
  burnSecret: async (token: string) => {
    const response = await api.post<ApiResponse<null>>(`${baseUrl}/burn/${token}`);
    return response.data;
  },
  exportCsvUrl: () => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    return `${base}${baseUrl}/export.csv`;
  },
};
