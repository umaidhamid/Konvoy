import { createApi } from "./api.js";
import config from "./config.js";
import type { LoginResponse } from "../types/auth.js";

export async function login(
  domain: string,
  email: string,
  password: string
) {
  const api = createApi(domain);

  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    {
      email,
      password,
    }
  );

  config.set("domain", domain);
  config.set("accessToken", data.accessToken);
  config.set("refreshToken", data.refreshToken);

  return data.user;
}