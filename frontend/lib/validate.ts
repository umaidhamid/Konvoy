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
      error.errors.forEach((err) => toast.error(err.message));
      return null;
    }

    throw error;
  }
};