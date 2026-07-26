import { ZodError, ZodSchema } from "zod";
import { toast } from "sonner";

export const validate = <T>(
  schema: ZodSchema<T>,
  data: unknown
): T | null => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      error.issues.forEach((issue) => toast.error(issue.message));
      return null;
    }

    throw error;
  }
};
