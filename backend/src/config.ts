import dotenv from "dotenv";
import { parseDurationMs } from "./utils/duration.js";

dotenv.config();
const requiredEnv = [
  "PORT",
  "MONGO_URI",

  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",

  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_EXPIRES_IN",

  "ACCESS_TOKEN_MAX_AGE",
  "REFRESH_TOKEN_MAX_AGE",
  "SESSION_EXPIRES_MS",

  "FRONTEND_URL",

  "FILE_ENCRYPTION_KEY",

  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",

  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "REPLY_TO_EMAIL",
  "CONTACT_EMAIL",
];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.log("❌ Missing environment variables:");
  missing.forEach((key) => console.log(`- ${key}`));
} else {
  console.log("✅ All required environment variables are present.");
}

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

  !process.env.FRONTEND_URL ||
  !process.env.FILE_ENCRYPTION_KEY ||
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.RESEND_API_KEY ||
  !process.env.RESEND_FROM_EMAIL ||
  !process.env.REPLY_TO_EMAIL ||
  !process.env.CONTACT_EMAIL
) {
  throw new Error("Missing environment variables");
}

export const config = {
  FRONTEND_URL:process.env.FRONTEND_URL!,

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
  
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  replyToEmail: process.env.REPLY_TO_EMAIL,
  contactEmail: process.env.CONTACT_EMAIL,
};
