import { z } from "zod";

export const contactSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name cannot exceed 80 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters")
      .max(120, "Subject cannot exceed 120 characters"),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters")
      .max(2000, "Message cannot exceed 2000 characters"),
  }),
});
