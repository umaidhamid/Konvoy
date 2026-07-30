import { z } from "zod";

// Keep in sync with the express.json() body limit in backend/src/app.ts - a plan
// whose maxFileSizeBytes exceeds that limit would reject uploads before this app
// ever gets a chance to return a friendly message.
const MAX_ALLOWED_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const planBody = z.object({
  name: z.string().trim().min(1, "Plan name is required"),
  priceLabel: z.string().trim().optional(),
  priceSuffix: z.string().trim().optional(),
  description: z.string().trim().optional(),
  features: z.array(z.string().trim()).optional(),
  maxFileSizeBytes: z
    .number()
    .int()
    .positive("Max file size must be greater than 0")
    .max(MAX_ALLOWED_FILE_SIZE_BYTES, "Max file size can't exceed the server's request size limit"),
  maxFilesPerProject: z.number().int().positive("Max files per project must be greater than 0"),
  maxProjectsPerUser: z.number().int().positive("Max projects per user must be greater than 0"),
  maxStorageBytes: z.number().int().positive("Max storage must be greater than 0"),
  maxMembersPerProject: z.number().int().positive("Max members per project must be greater than 0"),
  pricingOptions: z
    .array(
      z.object({
        durationMonths: z.number().int().positive("Duration must be at least 1 month"),
        priceLabel: z.string().trim().min(1, "Price is required"),
      })
    )
    .optional(),
  isHidden: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const createPlanSchema = z.object({
  body: planBody,
});

const updatePlanSchema = z.object({
  body: planBody.partial(),
});

export { createPlanSchema, updatePlanSchema };
