import express from "express";

import { login, refresh, logout, register, isAuth } from "./auth.controller";

import { validate } from "../../middlewares/validate.middleware";

import { loginSchema, registerSchema } from "../../validations/auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

// The frontend axios interceptor calls "/api/v1/auth/refresh", so that's
// the primary route. "/refresh-token" is kept as an alias for other
// clients that still depend on the old path — both hit the same handler.
router.post("/refresh", refresh);
router.post("/refresh-token", refresh);

router.post("/logout", logout);
router.post("/register", validate(registerSchema), register);
router.get("/is-auth", authMiddleware, isAuth);

export default router;