import express from "express";

import {
  login,
  refresh,
  logout,
  register,
  isAuth,
  forgotPassword,
  resendverifytoken,
  verifyAccount,
  recoveryaccount
} from "./auth.controller";

import { validate } from "../../middlewares/validate.middleware";

import { loginSchema, registerSchema } from "../../validations/auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);
router.post("/refresh-token", refresh);

router.post("/logout", logout);
router.post("/register", validate(registerSchema), register);
router.get("/is-auth", authMiddleware, isAuth);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification", resendverifytoken);
router.post("/verify-account",verifyAccount)
router.post("recovery-account",recoveryaccount)

export default router;