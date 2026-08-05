import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getMyReferralInfo } from "./referral.controller.js";

const referralRouter = express.Router();

referralRouter.get("/mine", authMiddleware, getMyReferralInfo);

export default referralRouter;
