import { ZodType, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = err.flatten().fieldErrors;
        const firstMessage = Object.values(fieldErrors).flat().find((m): m is string => !!m);
        return res.status(400).json({
          success: false,
          message: firstMessage || "Validation failed",
          errors: fieldErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Validation failed",
      });
    }
  };