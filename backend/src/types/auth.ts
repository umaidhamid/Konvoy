// types/auth.ts

export interface JwtPayload {
  userId: string;
  email: string;
  role: "admin" | "user";
}