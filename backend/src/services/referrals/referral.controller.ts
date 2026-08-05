import { Response } from "express";
import { referralService } from "./referral.service.js";

const handleError = (res: Response, error: unknown) => {
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Something went wrong.";
  return res.status(status).json({ success: false, message });
};

// GET /referrals/mine
export const getMyReferralInfo = async (req: any, res: Response) => {
  try {
    const info = await referralService.getMyReferralInfo(req.user.userId);
    return res.status(200).json({ success: true, data: info });
  } catch (error) {
    return handleError(res, error);
  }
};
