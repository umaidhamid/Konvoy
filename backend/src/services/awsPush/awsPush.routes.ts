import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { pushToParameterStore } from "./awsPush.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/ssm", pushToParameterStore);

export default router;
