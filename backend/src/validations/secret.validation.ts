import { z } from "zod";

export const ALLOWED_EXPIRY_MINUTES = [10, 60, 1440, 10080] as const; // 10min, 1h, 1d, 7d
export const ALLOWED_MAX_VIEWS = [1, 3, 5, 10] as const; // null (omitted) = unlimited

const expiryField = z.number().refine((v) => (ALLOWED_EXPIRY_MINUTES as readonly number[]).includes(v), {
  message: "Invalid expiry duration",
});

const maxViewsField = z
  .number()
  .nullable()
  .refine((v) => v === null || (ALLOWED_MAX_VIEWS as readonly number[]).includes(v), {
    message: "Invalid view limit",
  })
  .optional();

const createSecretSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1, "Secret content is required").max(10000, "Secret can't exceed 10,000 characters"),
    expiresInMinutes: expiryField,
    maxViews: maxViewsField,
    label: z.string().trim().max(60, "Label can't exceed 60 characters").optional(),
    passphrase: z.string().trim().min(4, "Passphrase must be at least 4 characters").max(100).optional(),
    requireAuth: z.boolean().optional(),
  }),
});

const recreateSecretSchema = z.object({
  body: z.object({
    expiresInMinutes: expiryField,
    maxViews: maxViewsField,
  }),
});

const revealSecretSchema = z.object({
  body: z.object({
    passphrase: z.string().optional(),
  }),
});

const extendSecretSchema = z.object({
  body: z.object({
    addMinutes: expiryField,
  }),
});

export { createSecretSchema, recreateSecretSchema, revealSecretSchema, extendSecretSchema };
