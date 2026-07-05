import dotenv from "dotenv";

dotenv.config();


if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET ||
  !process.env.ACCESS_TOKEN_EXPIRES_IN ||
  !process.env.REFRESH_TOKEN_EXPIRES_IN ||
  !process.env.MONGO_URI ||
  !process.env.PORT ||
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASSWORD ||
  !process.env.FRONTEND_URL
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
};
