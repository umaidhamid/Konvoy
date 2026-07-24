import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { config } from "../config.js";
import type { JwtPayload } from "../types/auth.js";

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiresIn as SignOptions["expiresIn"],
    }
  );
};

export const  generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiresIn as SignOptions["expiresIn"]
    }
  );
};