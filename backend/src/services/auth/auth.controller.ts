import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/users.models";
import Session from "../../models/Session";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

import { hashToken } from "../../utils/hashToken";
import { verificationEmailTemplate } from "../../utils/emailTemplates";
import { sendEmail } from "../../utils/sendEmail";

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
    const isPasswordCorrect = await bcrypt.compare(
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
        message: "Your account is not verified. Please verify your email.",
      });
    }
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
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

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as {
        userId: string;
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
    });

    await Session.create({
      userId: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_MS),
    });

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
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
    const { fullname, username, phoneNumber, email, password } = req.body;

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    );

    const user = await User.create({
      fullname,
      username,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      phoneNumber,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false,
    });

    const verificationLink = `${config.FRONTEND_URL}/verify-email/${verificationToken}`;

    const mail = verificationEmailTemplate(
      user.username as string,
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
      },
      verificationLink,
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
      "_id fullname username email isVerified isDeactivated",
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
        username: user.username,
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