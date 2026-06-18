import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
(schema: AnyZodObject) =>
(
req: Request,
res: Response,
next: NextFunction
) => {
try {
schema.parse({
body: req.body,
params: req.params,
query: req.query,
});

  next();
} catch (error) {
if (error instanceof ZodError) {
  return res.status(400).json({
    success: false,
    errors: error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  });
}

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
};
