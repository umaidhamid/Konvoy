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
  recoveryAccount,
  resetPassword,
  changePassword
} from "./auth.controller";

import { validate } from "../../middlewares/validate.middleware";

import { loginSchema, registerSchema } from "../../validations/auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);
router.post("/refresh-token", refresh);
router.get("/is-auth", authMiddleware, isAuth);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification", resendverifytoken);
router.post("/verify-account",verifyAccount)
router.post("/recover-account",recoveryAccount)
router.post("/reset-password",resetPassword)
router.get("/change-password", authMiddleware, changePassword)
export default router;