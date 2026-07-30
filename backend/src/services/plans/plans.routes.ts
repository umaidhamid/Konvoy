import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getMyPlan, getPublicPlans } from "./plans.controller.js";

const plansRouter = express.Router();

plansRouter.get("/public", getPublicPlans);
plansRouter.get("/me", authMiddleware, getMyPlan);

export default plansRouter;
