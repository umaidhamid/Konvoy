import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      (
        error.response?.data?.code === "NO_ACCESS_TOKEN" ||
        error.response?.data?.code === "ACCESS_TOKEN_EXPIRED"
      ) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          failedQueue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");

        failedQueue.forEach((cb) => cb());
        failedQueue = [];

        return api(originalRequest);
      } catch (err) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: any, fallback: string): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.status === 413) {
    return "Upload is too large. Please reduce the file size and try again.";
  }
  if (!error?.response && (error?.code === "ERR_NETWORK" || error?.request)) {
    return "Network error — check your connection and try again.";
  }
  return fallback;
}

export default api;