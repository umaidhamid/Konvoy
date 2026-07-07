import axios from "axios";
export function createApi(domain) {
    return axios.create({
        baseURL: domain,
        headers: {
            "Content-Type": "application/json",
        },
        timeout: 10000,
    });
}
//# sourceMappingURL=api.js.map