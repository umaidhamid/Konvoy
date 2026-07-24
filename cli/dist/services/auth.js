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
//# sourceMappingURL=auth.js.map