import axios, {
AxiosError,
AxiosResponse,
InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
withCredentials: true,
});

let isRefreshing = false;

let failedQueue: {
resolve: (value?: AxiosResponse) => void;
reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (
error: unknown = null,
response?: AxiosResponse
) => {
failedQueue.forEach((promise) => {
if (error) {
promise.reject(error);
} else {
promise.resolve(response);
}
});

failedQueue = [];
};
api.interceptors.response.use(
(response) => response,
async (error: AxiosError) => {
const originalRequest = error.config as InternalAxiosRequestConfig & {
_retry?: boolean;
};

const code = (error.response?.data as { code?: string })?.code;

if (
  code === "ACCESS_TOKEN_EXPIRED" &&
  !originalRequest._retry
) {
  originalRequest._retry = true;

  try {
    await api.post("/api/v1/auth/refresh");

    return api(originalRequest);
  } catch (err) {
    window.location.href = "/login";

    return Promise.reject(err);
  }
}

if (
  code === "REFRESH_TOKEN_EXPIRED" ||
  code === "INVALID_REFRESH_TOKEN" ||
  code === "NO_REFRESH_TOKEN"
) {
  window.location.href = "/login";
}

return Promise.reject(error);
}
);


export default api;
