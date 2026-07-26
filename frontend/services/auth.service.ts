import api from "@/lib/api";
const baseUrl = "/auth";
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post(`${baseUrl}/login`, { email, password });
    return response.data;
  },
  register: async (
    fullname: string,
    phoneNumber: string,
    email: string,
    password: string,
  ) => {
    const response = await api.post(`${baseUrl}/register`, {
      fullname,
      phoneNumber,
      email,
      password,
    });

    return response.data;
  },
  isAuth: async () => {
    const response = await api.get(`${baseUrl}/is-auth`);
    return response.data;
  },
  logout: async () => {
    const response = await api.post(`${baseUrl}/logout`);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post(`${baseUrl}/forgot-password`, { email });
    return response.data;
  }, 
  recoverAccount: async (email: string, token: string, newPassword: string) => {
    const response = await api.post(`${baseUrl}/recover-account`, { email, token, newPassword });
    return response.data;
  }, 
  resetPassword: async (token: string, newPassword: string,email:string) => {
    const response = await api.post(`${baseUrl}/reset-password`, { token, newPassword,email });
    return response.data;
  },
  updateProfile: async (fullname: string) => {
    const response = await api.put(`${baseUrl}/update-profile`, { fullname });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put(`${baseUrl}/change-password`, { currentPassword, newPassword });
    return response.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post(`${baseUrl}/avatar`, formData);
    return response.data;
  },
  requestEmailChange: async (newEmail: string, password: string) => {
    const response = await api.post(`${baseUrl}/change-email`, { newEmail, password });
    return response.data;
  },
  confirmEmailChange: async (token: string, email: string) => {
    const response = await api.post(`${baseUrl}/confirm-email-change`, { token, email });
    return response.data;
  },
  regenerateRecoveryCode: async (password: string) => {
    const response = await api.post(`${baseUrl}/regenerate-recovery-code`, { password });
    return response.data;
  },
};
