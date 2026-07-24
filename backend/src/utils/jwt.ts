import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import type { JwtPayload } from "../types/auth";

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiresIn as SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiresIn as SignOptions["expiresIn"]
    }
  );
};