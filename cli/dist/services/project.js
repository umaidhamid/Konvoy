import config from "./config.js";
import { createApi } from "./api.js";
export async function getProjects() {
    const domain = config.get("domain");
    const token = config.get("accessToken");
    console.log(domain, token);
    const api = createApi(domain);
    const { data } = await api.get("/projects/users-projects", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data.data;
}
export async function connectProject(projectId) {
    const domain = config.get("domain");
    const token = config.get("accessToken");
    const api = createApi(domain);
    const { data } = await api.get(`/projectfile/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data.data;
}
export async function getProjectFiles(slug) {
    const domain = config.get("domain");
    const token = config.get("accessToken");
    const api = createApi(domain);
    const { data } = await api.get(`/projectfile/${slug}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
}
export async function getProjectFileContent(fileId) {
    const domain = config.get("domain");
    const token = config.get("accessToken");
    const api = createApi(domain);
    const { data } = await api.get(`/projectfile/single/${fileId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
}
//# sourceMappingURL=project.js.map