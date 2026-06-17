import dotenv from "dotenv";

dotenv.config();


// console.log({
//   ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
//   REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
//   ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
//   REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
//   MONGO_URI: process.env.MONGO_URI,
//   PORT: process.env.PORT,
// });

if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET ||
  !process.env.ACCESS_TOKEN_EXPIRES_IN ||
  !process.env.REFRESH_TOKEN_EXPIRES_IN ||
  !process.env.MONGO_URI ||
  !process.env.PORT
) {
  throw new Error("Missing environment variables");
}

export const config = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
};