import { z } from "zod";

const MAX_SIDE_LENGTH = 200_000; // ~200KB per side

export const ALLOWED_DIFF_EXPIRY_MINUTES = [10, 60, 1440, 10080, 43200] as const; // 10min, 1h, 1d, 7d, 30d
export const ALLOWED_DIFF_MAX_VIEWS = [1, 3, 5, 10] as const; // null (omitted) = unlimited

const contentField = z.string().max(MAX_SIDE_LENGTH, "Content can't exceed 200,000 characters");

const maxViewsField = z
  .number()
  .nullable()
  .refine((v) => v === null || (ALLOWED_DIFF_MAX_VIEWS as readonly number[]).includes(v), {
    message: "Invalid view limit",
  })
  .optional();

export const createDiffShareSchema = z.object({
  body: z.object({
    title: z.string().trim().max(80, "Title can't exceed 80 characters").optional(),
    leftLabel: z.string().trim().max(40, "Label can't exceed 40 characters").optional(),
    rightLabel: z.string().trim().max(40, "Label can't exceed 40 characters").optional(),
    leftContent: contentField,
    rightContent: contentField,
    language: z.string().trim().max(30).optional(),
    expiresInMinutes: z.number().refine((v) => (ALLOWED_DIFF_EXPIRY_MINUTES as readonly number[]).includes(v), {
      message: "Invalid expiry duration",
    }),
    maxViews: maxViewsField,
  }),
});
