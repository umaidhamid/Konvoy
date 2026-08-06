import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { compareEnvFiles } from "./envDrift.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/compare", compareEnvFiles);

export default router;
