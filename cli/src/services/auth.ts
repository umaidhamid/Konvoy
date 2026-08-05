import { createApi } from "./api.js";
import config, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./config.js";
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
  config.set(ACCESS_TOKEN_KEY, data.accessToken);
  config.set(REFRESH_TOKEN_KEY, data.refreshToken);

  return data.user;
}

// Pings the server with the stored access token - confirms both that the
// server is reachable and that the token is still valid.
export async function whoAmI() {
  const domain = config.get("domain") as string;
  const token = config.get(ACCESS_TOKEN_KEY) as string;

  const api = createApi(domain);

  const { data } = await api.get("/auth/is-auth", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.user;
}
