import { Request, Response } from "express";
import {
  createRecoveryCode,
  verifyRecoveryCode,
} from "../../utils/recoveryCode.js";
import User from "../../models/users.model.js";
import Session from "../../models/Session.js";
import * as crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import type { JwtPayload } from "../../types/auth.js";
import { hashToken } from "../../utils/hashToken.js";
import {
  verificationEmailTemplate,
  forgotPasswordTemplate,
  confirmEmailChangeTemplate,
} from "../../utils/emailTemplates.js";
import {
  uploadAvatarBuffer,
  extractAvatarPublicId,
  deleteAvatar,
} from "../../utils/cloudinary.js";
import { avatarUpload } from "../../middlewares/upload.middleware.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  SESSION_EXPIRES_MS,
} from "../../config/auth.config.js";
import { config } from "../../config.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { describeUserAgent } from "../../utils/userAgent.js";
import { Resend } from "resend";

const resend = new Resend(config.resendApiKey);
console.log(resend);
console.log(config.resendApiKey);
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }
    if (user.isDeactivated) {
      return res.status(401).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }
    if (!user.passwordHash) {
      return res.status(500).json({
        message: "Password not set for this account.",
      });
    }
    const isPasswordCorrect = await comparePassword(
      password,
      user.passwordHash!,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        code: "ACCOUNT_NOT_VERIFIED",
        message:
          "Your account is not verified. Please verify your email first.",
      });
    }
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email!,
      role: user.role as "user" | "admin",
    };
    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email!,
      role: user.role as "user" | "admin",
    });

    await Session.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_MS),
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  console.log("REFRESH HIT");
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "NO_REFRESH_TOKEN",
        message: "No refresh token provided.",
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        config.refreshTokenSecret,
      ) as JwtPayload;
    } catch (err) {
      // Clean up the stale cookie regardless of which JWT error this is
      res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
      res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          code: "REFRESH_TOKEN_EXPIRED",
          message: "Refresh token expired",
        });
      }
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token.",
      });
    }

    const session = await Session.findOne({
      tokenHash: hashToken(refreshToken),
    });

    if (!session) {
      res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
      res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Session not found.",
      });
    }

    // Reject and clear the session if it's expired, even if the JWT itself
    // hasn't expired yet (defensive check in case TTLs drift).
    if (session.expiresAt.getTime() < Date.now()) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
      res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired.",
      });
    }

    await Session.deleteOne({
      _id: session._id,
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    await Session.create({
      userId: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_MS),
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.cookie("accessToken", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
    });
  } catch {
    return res.status(401).json({
      success: false,
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid refresh token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await Session.deleteOne({
        tokenHash: hashToken(refreshToken),
      });
    }

    res.clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
    });
  } catch {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, phoneNumber, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists.",
        });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const { code, hash: hashedCode } = await createRecoveryCode();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    );

    const user = await User.create({
      fullname,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      phoneNumber,
      verificationToken,
      verificationTokenExpiresAt,
      recoveryCode: {
        code: hashedCode,
        used: false,
      },
      isVerified: false,
    });

    const verificationLink = `${config.FRONTEND_URL}/verify?token=${verificationToken}&email=${email.toLowerCase()}`;

    const mail = verificationEmailTemplate(
      user.fullname as string,
      verificationLink,
    );

    try {
      await sendEmail({
        to: user.email!,
        subject: mail.subject,
        html: mail.html,
      });
    } catch (emailErr) {
      // Don't fail registration just because the email provider hiccuped;
      // the user account was already created successfully.
      console.error("Failed to send verification email:", emailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        verificationLink,
        recoveryCode: code,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
export const isAuth = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select(
      "_id fullname email profileImage isVerified isDeactivated role",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found.",
      });
    }

    if (user.isDeactivated || !user.isVerified) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        message: "Account is inactive or not verified.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullname } = req.body;

    if (!fullname?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Full name is required." });
    }

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { fullname: fullname.trim() },
      { new: true },
    ).select("_id fullname email profileImage");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

// POST /auth/avatar - multipart form, field name "avatar"
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    await new Promise<void>((resolve, reject) => {
      avatarUpload.single("avatar")(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No avatar file was provided." });
    }

    const user = await User.findById(req.user?.userId).select(
      "_id fullname email profileImage",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const oldPublicId = extractAvatarPublicId(user.profileImage);

    const { url } = await uploadAvatarBuffer(file.buffer, String(user._id));

    user.profileImage = url;
    await user.save();

    if (oldPublicId) {
      await deleteAvatar(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    const status =
      error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Avatar must be 2MB or smaller."
        : error.message || "Internal server error.";
    return res.status(status).json({ success: false, message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Your account is not verified. Please verify your account first.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetLink = `${config.FRONTEND_URL}/auth/forgot-password?token=${resetToken}&email=${user.email}`;

    const mail = forgotPasswordTemplate(user.fullname as string, resetLink);

    await sendEmail({
      to: user.email!,
      subject: mail.subject,
      html: mail.html,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to do this.",
      });
    }

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await comparePassword(
      currentPassword,
      user.passwordHash!,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const isSamePassword = await comparePassword(
      newPassword,
      user.passwordHash!,
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password.",
      });
    }

    user.passwordHash = await hashPassword(newPassword);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// POST /auth/change-email - sends a confirmation link to the new address;
// the email on the account does not change until that link is clicked.
export const requestEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail, password } = req.body;
    const normalizedNewEmail = String(newEmail).trim().toLowerCase();

    const user = await User.findById(req.user?.userId).select(
      "+passwordHash fullname email",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    console.log({
      user,
      password,
      passwordHash: user.passwordHash,
    });
    const isPasswordCorrect = await comparePassword(
      password,
      user.passwordHash!,
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect." });
    }

    if (normalizedNewEmail === user.email) {
      return res
        .status(400)
        .json({
          success: false,
          message: "That's already your current email.",
        });
    }

    const existingUser = await User.findOne({ email: normalizedNewEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists.",
        });
    }

    const changeToken = crypto.randomBytes(32).toString("hex");

    user.pendingEmail = normalizedNewEmail;
    user.pendingEmailToken = changeToken;
    user.pendingEmailTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    await user.save();

    const confirmLink = `${config.FRONTEND_URL}/verify-email-change?token=${changeToken}&email=${user.email}`;
    const mail = confirmEmailChangeTemplate(
      user.fullname as string,
      normalizedNewEmail,
      confirmLink,
    );

    await sendEmail({
      to: normalizedNewEmail,
      subject: mail.subject,
      html: mail.html,
    });

    return res.status(200).json({
      success: true,
      message: `A confirmation link was sent to ${normalizedNewEmail}. Your email won't change until you click it.`,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// POST /auth/confirm-email-change
export const confirmEmailChange = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      pendingEmailToken: token,
    });

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid or expired confirmation link.",
        });
    }

    if (
      !user.pendingEmailTokenExpiresAt ||
      user.pendingEmailTokenExpiresAt.getTime() < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Confirmation link has expired." });
    }

    if (!user.pendingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "No pending email change found." });
    }

    const emailTaken = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id },
    });
    if (emailTaken) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists.",
        });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.pendingEmailToken = undefined;
    user.pendingEmailTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your email has been updated successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// POST /auth/regenerate-recovery-code
export const regenerateRecoveryCode = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user?.userId).select("+passwordHash");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isPasswordCorrect = await comparePassword(
      password,
      user.passwordHash!,
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect." });
    }

    const { code, hash: hashedCode } = await createRecoveryCode();

    user.recoveryCode = { code: hashedCode, used: false };
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Recovery code regenerated successfully.",
      recoveryCode: code,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const resendverifytoken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (user.verificationTokenExpiresAt) {
      return res.status(400).json({
        success: false,
        message: `A verification email has already been sent to ${user.email}.`,
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified.",
      });
    }

    const newVerificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = newVerificationToken;

    user.verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await user.save();

    const verificationLink = `${config.FRONTEND_URL}/verify?token=${newVerificationToken}&email=${user.email}`;

    const mail = verificationEmailTemplate(
      user.fullname as string,
      verificationLink,
    );

    await sendEmail({
      to: user.email!,
      subject: mail.subject,
      html: mail.html,
    });

    return res.status(200).json({
      success: true,
      message: "Verification link sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      verificationToken: token,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification link.",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Account is already verified.",
      });
    }

    if (
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification link has expired.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await resend.events.send({
      event: "welcome_mail",
      email: user.email!,
      payload: {  
        full_name: user.fullname,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Account verified successfully.",
    });
  } catch (error) {
    console.error("Verify account error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const recoveryAccount = async (req: Request, res: Response) => {
  try {
    const { email, token: recoveryCode, newPassword } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+recoveryCode.code");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not verified. Please verify your account first.",
      });
    }

    if (!user.recoveryCode?.code) {
      return res.status(400).json({
        success: false,
        message: "Recovery code not available. Please request a new one.",
      });
    }

    if (user.recoveryCode.used) {
      return res.status(400).json({
        success: false,
        message:
          "Recovery code has already been used. Please request a new one.",
      });
    }
    const cleanedCode = recoveryCode.trim().replace(/\s+/g, "");
    const isValidCode = await verifyRecoveryCode({
      code: cleanedCode,
      hash: user.recoveryCode.code,
    });

    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid recovery code.",
      });
    }

    user.passwordHash = await hashPassword(newPassword);

    user.recoveryCode.used = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Recovery account error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required.",
      });
    }

    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    }).select("+resetPasswordToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not verified. Please verify your account first.",
      });
    }
    if (
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired.",
      });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    user.passwordHash = await hashPassword(newPassword);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// GET /auth/sessions - every device currently signed into this account
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const currentTokenHash = req.cookies.refreshToken ? hashToken(req.cookies.refreshToken) : null;

    const sessions = await Session.find({ userId: req.user?.userId })
      .select("userAgent ip createdAt updatedAt tokenHash")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions.map((s: any) => ({
        _id: s._id,
        device: describeUserAgent(s.userAgent || ""),
        ip: s.ip || "",
        createdAt: s.createdAt,
        lastActiveAt: s.updatedAt,
        isCurrent: !!currentTokenHash && s.tokenHash === currentTokenHash,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// DELETE /auth/sessions/:sessionId - sign out one specific device (not this one)
export const revokeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const currentTokenHash = req.cookies.refreshToken ? hashToken(req.cookies.refreshToken) : null;

    const session = await Session.findOne({ _id: sessionId, userId: req.user?.userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }
    if (currentTokenHash && session.tokenHash === currentTokenHash) {
      return res.status(400).json({ success: false, message: "Use logout to sign out of this device." });
    }

    await session.deleteOne();

    return res.status(200).json({ success: true, message: "Signed out of that device." });
  } catch (error) {
    console.error("Revoke session error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// DELETE /auth/sessions - sign out of every device except this one
export const revokeOtherSessions = async (req: AuthRequest, res: Response) => {
  try {
    const currentTokenHash = req.cookies.refreshToken ? hashToken(req.cookies.refreshToken) : null;

    const result = await Session.deleteMany({
      userId: req.user?.userId,
      tokenHash: { $ne: currentTokenHash },
    });

    return res.status(200).json({
      success: true,
      message: `Signed out of ${result.deletedCount} other device(s).`,
    });
  } catch (error) {
    console.error("Revoke other sessions error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
