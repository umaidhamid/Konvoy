import { z } from "zod";

const sendBroadcastSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title can't exceed 120 characters"),
      message: z.string().trim().min(3, "Message must be at least 3 characters").max(1000, "Message can't exceed 1000 characters"),
      audience: z.enum(["all", "verified", "plan"]),
      planId: z.string().optional(),
    })
    .refine((data) => data.audience !== "plan" || !!data.planId, {
      message: "Choose a plan to target.",
      path: ["planId"],
    }),
});

export { sendBroadcastSchema };
