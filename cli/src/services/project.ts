import config from "./config.js";
import { createApi } from "./api.js";

export async function getProjects() {

    const domain = config.get("domain") as string;
    const token = config.get("accessToken") as string;
    console.log(domain, token);
    const api = createApi(domain);

    const { data } = await api.get("/projects/users-projects", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return data.data;
}
export async function connectProject(projectId: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.get(
    `/projectfile/${projectId}`,
 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.data;
}
export async function getProjectFiles(slug: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.get(`/projectfile/${slug}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getProjectFileContent(fileId: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.get(`/projectfile/single/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}