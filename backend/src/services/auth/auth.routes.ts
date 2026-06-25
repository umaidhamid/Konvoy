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

import { loginSchema, registerSchema,forgotPasswordSchema,resetPasswordSchema,changePasswordSchema,verifyAccountSchema,resendVerificationSchema,recoveryAccountSchema } from "../../validations/auth.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);
router.post("/register", validate(registerSchema), register);
router.post("/logout", logout);
router.post("/refresh-token", refresh);
router.get("/is-auth", authMiddleware, isAuth);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verification", validate(resendVerificationSchema), resendverifytoken);
router.post("/verify-account", validate(verifyAccountSchema), verifyAccount);
router.post("/recover-account", validate(recoveryAccountSchema), recoveryAccount);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);
export default router;