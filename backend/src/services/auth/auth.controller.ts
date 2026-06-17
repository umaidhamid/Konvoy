import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/users.models";
import Session from "../../models/Session";

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

import { hashToken } from "../../utils/hashToken";

import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  SESSION_EXPIRES_MS,
} from "../../config/auth.config";
import { config } from "../../config";
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
if(user.isDeactivated){
 return  res.status(401).json({message:"your account is Deactivated please contact the support."
  })}
if (!user.passwordHash) {
  return res.status(500).json({
    message: "User password not found",
  });
}
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash!);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
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
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as {
      userId: string;
    };

    const session = await Session.findOne({
      tokenHash: hashToken(refreshToken),
    });

    if (!session) {
      return res.status(401).json({
        message: "Session not found",
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

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
    });
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const register=async (req:Request,res:Response)=>{
try{

  const {fullname,username,phoneNumber,email,password}=req.body
const existingUser=await User.findOne({email})
if(!existingUser)return res.status(401).json({success:false,message:"Email already Exist "})
  const hashedPassword =await bcrypt.hash(password,12)
    const verificationToken = crypto.randomBytes(32).toString("hex");
     const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    ); const user = await User.create({
      fullname,
      username,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
phoneNumber
      verificationToken,
      verificationTokenExpiresAt,

      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};