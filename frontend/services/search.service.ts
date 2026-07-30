import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { SearchResults } from "@/types/search.types";

export const searchService = {
  search: async (query: string) => {
    const response = await api.get<ApiResponse<SearchResults>>("/search", { params: { q: query } });
    return response.data;
  },
};
