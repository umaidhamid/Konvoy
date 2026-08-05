import api from "@/lib/api";
import { ApiResponse } from "@/types/project.types";
import { MyReferralInfo } from "@/types/referral.types";

export const referralService = {
  getMyReferralInfo: async () => {
    const response = await api.get<ApiResponse<MyReferralInfo>>("/referrals/mine");
    return response.data;
  },
};
