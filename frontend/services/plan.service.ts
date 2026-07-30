import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { MyPlanResponse, Plan } from "@/types/plan.types";

export const planService = {
  getMyPlan: async () => {
    const response = await api.get<ApiResponse<MyPlanResponse>>("/plans/me");
    return response.data;
  },
  getPublicPlans: async () => {
    const response = await api.get<ApiResponse<Plan[]>>("/plans/public");
    return response.data;
  },
};
