import { createApi } from "./api.js";
import config from "./config.js";
export async function login(domain, email, password) {
    const api = createApi(domain);
    const { data } = await api.post("/auth/login", {
        email,
        password,
    });
    config.set("domain", domain);
    config.set("accessToken", data.accessToken);
    config.set("refreshToken", data.refreshToken);
    return data.user;
}
// Pings the server with the stored access token - confirms both that the
// server is reachable and that the token is still valid.
export async function whoAmI() {
    const domain = config.get("domain");
    const token = config.get("accessToken");
    const api = createApi(domain);
    const { data } = await api.get("/auth/is-auth", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data.user;
}
//# sourceMappingURL=auth.js.map