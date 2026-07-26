import config from "./config.js";
import { createApi } from "./api.js";

export async function createProject(name: string, description?: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.post(
    "/projects/create",
    { name, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.data;
}

export async function deleteProject(projectId: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.delete(`/projects/delete/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteProjectFile(fileId: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.delete(`/projectfile/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createProjectFile(slug: string, name: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.post(
    `/projectfile/${slug}`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function updateProjectFileContent(fileId: string, content: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.put(
    `/projectfile/${fileId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function getProjects() {

    const domain = config.get("domain") as string;
    const token = config.get("accessToken") as string;
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

export async function addProjectMember(
  projectId: string,
  email: string,
  fileIds?: string[]
) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.post(
    `/projects/${projectId}/members`,
    { email, fileIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function leaveProject(projectId: string) {
  const domain = config.get("domain") as string;
  const token = config.get("accessToken") as string;

  const api = createApi(domain);

  const { data } = await api.post(
    `/projects/${projectId}/leave`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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