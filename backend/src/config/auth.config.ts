import { CookieOptions } from "express";

// Cookie names - shared with the CLI's local token store so both sides agree
// on what to call these (see cli/src/services/auth.ts).
export const ACCESS_TOKEN_COOKIE_NAME = "konvoy_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "konvoy_refresh_token";

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const ACCESS_TOKEN_MAX_AGE =
  24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

export const SESSION_EXPIRES_MS =
  7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

const commonCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...commonCookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...commonCookieOptions,
  maxAge: REFRESH_TOKEN_MAX_AGE,
};