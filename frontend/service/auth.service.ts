import api from "@/lib/api";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (fullname: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { fullname, email, password });
    return response.data;
  },
  isAuth: async () => {
    const response = await api.get("/auth/is-auth");
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};