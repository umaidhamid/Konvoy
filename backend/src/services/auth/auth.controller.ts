import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  createRecoveryCode,
  verifyRecoveryCode,
} from "../../utils/recoveryCode";
import User from "../../models/users.models";
import Session from "../../models/Session";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

import { hashToken } from "../../utils/hashToken";
import {
  verificationEmailTemplate,
  forgotPasswordTemplate,
} from "../../utils/emailTemplates";
import { sendEmail } from "../../utils/sendEmail";
import { hashPassword, comparePassword } from "../../utils/password";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  SESSION_EXPIRES_MS,
} from "../../config/auth.config";
import { config } from "../../config";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    if (user.isDeactivated) {
      return res.status(401).json({
        message: "your account is Deactivated please contact the support.",
      });
    }
    if (!user.passwordHash) {
      return res.status(500).json({
        message: "User password not found",
      });
    }
    const isPasswordCorrect = await comparePassword(
      password,
      user.passwordHash!,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        code: "ACCOUNT_NOT_VERIFIED",
        message: "Your account is not verified. Please verify your email.",
      });
    }
    const payload = {
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
    });

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "NO_REFRESH_TOKEN",
        message: "Unauthorized",
      });
    }

    let decoded: { userId: string; email: string; role: "user" | "admin" };
    try {
      decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as {
        userId: string;
        email: string;
        role: "user" | "admin";
      };
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
        message: "Invalid refresh token",
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
        message: "Session not found",
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
        message: "Refresh token expired",
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
      message: "Internal server error",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, phoneNumber, email, password } = req.body;

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const { code, hash: hashedCode } = await createRecoveryCode();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    );

    const user = await User.create({
      fullname,
      email: normalizedEmail,
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

    const verificationLink = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${normalizedEmail}`;

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
      message: "Account created successfully",
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
      message: "Internal server error",
    });
  }
};
export const isAuth = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select(
      "_id fullname email isVerified isDeactivated",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.isDeactivated || !user.isVerified) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        message: "Account is inactive or not verified",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Account is not verified",
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
      message: "Password reset link sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "Unauthorized",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await comparePassword(
      currentPassword,
      user.passwordHash!,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await comparePassword(
      newPassword,
      user.passwordHash!,
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password",
      });
    }

    user.passwordHash = await hashPassword(newPassword);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const resendverifytoken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verificationTokenExpiresAt) {
      return res.status(400).json({
        success: false,
        message: `Verification token has already sended on mail ${user.email}`,
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const newVerificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = newVerificationToken;

    user.verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await user.save();

    const verificationLink = `${config.FRONTEND_URL}/verify-email/${newVerificationToken}&email=${user.email}`;

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
      message: "Verification link sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      verificationToken: token,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification link",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    if (user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification link has expired",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error("Verify account error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const recoveryAccount = async (req: Request, res: Response) => {
  try {
    const { email, token: recoveryCode, newPassword } = req.body;

    if (!email || !recoveryCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, recovery code and new password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+recoveryCode.code");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message:
          "Account is deactivated sorry for the inconvenience contact support",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account is not verified please verify your account first",
      });
    }

    if (!user.recoveryCode?.code) {
      return res.status(400).json({
        success: false,
        message: "Recovery code not available please request a new one",
      });
    }

    if (user.recoveryCode.used) {
      return res.status(400).json({
        success: false,
        message: "Recovery code has already been used please request a new one",
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
        message: "Invalid recovery code",
      });
    }

    user.passwordHash = await hashPassword(newPassword);

    user.recoveryCode.used = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Recovery account error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required",
      });
    }

    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    }).select("+resetPasswordToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message:
          "Account is deactivated sorry for the inconvenience contact support",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account is not verified please verify your account first",
      });
    }
    if (
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired",
      });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    user.passwordHash = await hashPassword(newPassword);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
