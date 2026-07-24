import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export const authMiddleware = (
  req: AuthRequest, 
  res: Response,
  next: NextFunction,
) => {
  try {
    let accessToken = req.cookies.accessToken;
 if (!accessToken) {
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        code: "NO_ACCESS_TOKEN",
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;

    req.user = { userId: decoded.userId, role: decoded.role, email: decoded.email };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_ACCESS_TOKEN",
      message: "Invalid access token",
    });
  }
};