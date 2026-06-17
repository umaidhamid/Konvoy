import jwt,{ SignOptions } from "jsonwebtoken";
import { config } from "../config";

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(
    payload,
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiresIn as SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(
    payload,
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiresIn as SignOptions["expiresIn"]
    }
  );
};