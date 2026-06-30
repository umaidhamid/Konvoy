import { CookieOptions } from "express";

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const ACCESS_TOKEN_MAX_AGE =
  15*60 * 1000;

export const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

export const SESSION_EXPIRES_MS =
  7 * 24 * 60 * 60 * 1000;

const commonCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...commonCookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...commonCookieOptions,
  maxAge: REFRESH_TOKEN_MAX_AGE,
};