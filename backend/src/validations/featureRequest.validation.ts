import { z } from "zod";

const createFeatureRequestSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title can't exceed 120 characters"),
    description: z.string().trim().max(2000, "Description can't exceed 2000 characters").optional(),
  }),
});

const setStatusSchema = z.object({
  body: z.object({
    status: z.enum(["open", "planned", "in-progress", "done", "declined"]),
  }),
});

export { createFeatureRequestSchema, setStatusSchema };
