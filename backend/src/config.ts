import dotenv from "dotenv";
import { parseDurationMs } from "./utils/duration.js";

dotenv.config();


if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET ||
  !process.env.ACCESS_TOKEN_EXPIRES_IN ||
  !process.env.REFRESH_TOKEN_EXPIRES_IN ||
  !process.env.ACCESS_TOKEN_MAX_AGE ||
  !process.env.REFRESH_TOKEN_MAX_AGE ||
  !process.env.SESSION_EXPIRES_MS ||
  !process.env.MONGO_URI ||
  !process.env.PORT ||
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASSWORD ||
  !process.env.FRONTEND_URL ||
  !process.env.FILE_ENCRYPTION_KEY ||
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing environment variables");
}

export const config = {
  FRONTEND_URL:process.env.FRONTEND_URL!,
  emailUser: process.env.EMAIL_USER!,
  emailPassword: process.env.EMAIL_PASSWORD,
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,

  accessTokenMaxAge: parseDurationMs(process.env.ACCESS_TOKEN_MAX_AGE!),
  refreshTokenMaxAge: parseDurationMs(process.env.REFRESH_TOKEN_MAX_AGE!),
  sessionExpiresMs: parseDurationMs(process.env.SESSION_EXPIRES_MS!),

  fileEncryptionKey: process.env.FILE_ENCRYPTION_KEY,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
