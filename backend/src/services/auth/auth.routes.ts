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
  changePassword,
  updateProfile,
  uploadAvatar,
  requestEmailChange,
  confirmEmailChange,
  regenerateRecoveryCode,
} from "./auth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyAccountSchema,
  resendVerificationSchema,
  recoveryAccountSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  regenerateRecoveryCodeSchema,
} from "../../validations/auth.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/logout", logout);
router.post("/refresh-token", refresh);
router.get("/is-auth", authMiddleware, isAuth);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verification", validate(resendVerificationSchema), resendverifytoken);
router.post("/verify-account", validate(verifyAccountSchema), verifyAccount);
router.post("/recover-account", validate(recoveryAccountSchema), recoveryAccount);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.put("/change-password", authMiddleware, validate(changePasswordSchema), changePassword);
router.put("/update-profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, uploadAvatar);
router.post("/change-email", authMiddleware, validate(requestEmailChangeSchema), requestEmailChange);
router.post("/confirm-email-change", validate(confirmEmailChangeSchema), confirmEmailChange);
router.post("/regenerate-recovery-code", authMiddleware, validate(regenerateRecoveryCodeSchema), regenerateRecoveryCode);
export default router;