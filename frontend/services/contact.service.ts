import api from "@/lib/api";
const baseUrl = "/contact";

export const contactService = {
  send: async (name: string, email: string, subject: string, message: string) => {
    const response = await api.post(`${baseUrl}/send`, {
      name,
      email,
      subject,
      message,
    });

    return response.data;
  },
};
