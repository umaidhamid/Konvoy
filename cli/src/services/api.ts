import axios from "axios";

export function createApi(domain: string) {
  return axios.create({
    baseURL: domain,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
}