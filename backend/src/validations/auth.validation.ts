import { transform, z } from "zod";

/* -------------------------------------------------------------------------- */
/*                               Reusable Fields                              */
/* -------------------------------------------------------------------------- */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password cannot exceed 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const loginPassword = z
  .string()
  .min(1, "Password is required");

const fullname = z
  .string()
  .trim()
  .min(3, "Full name must be at least 3 characters")
  .max(50, "Full name cannot exceed 50 characters")
  .transform((v) => v.replace(/\s+/g, " "));

const phoneNumber = z
  .string()
  .trim()
  .regex(
    /^\+?[1-9]\d{7,14}$/,
    "Invalid phone number"
  )
  .optional();
const token = z
  .string()
  .trim()
  .min(10, "Invalid token");

const recoveryCode = z
  .string()
  .trim()
  .min(6, "Recovery code is invalid")
  .max(20);

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  body: z
    .object({
      email,
      password: loginPassword,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                  */
/* -------------------------------------------------------------------------- */

export const registerSchema = z.object({
  body: z
    .object({
      fullname,
      email,
      password,
      phoneNumber,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                              FORGOT PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                               RESET PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email,
      token,
      newPassword: password,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                              CHANGE PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: loginPassword,
      newPassword: password,
    })
    .strict()
    .refine(
      (data) => data.currentPassword !== data.newPassword,
      {
        message:
          "New password must be different from current password",
        path: ["newPassword"],
      }
    ),
});

/* -------------------------------------------------------------------------- */
/*                              VERIFY ACCOUNT                                */
/* -------------------------------------------------------------------------- */

export const verifyAccountSchema = z.object({
  body: z
    .object({
      email,
      token,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                           RESEND VERIFICATION                              */
/* -------------------------------------------------------------------------- */

export const resendVerificationSchema = z.object({
  body: z
    .object({
      email,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                             RECOVERY ACCOUNT                               */
/* -------------------------------------------------------------------------- */

export const recoveryAccountSchema = z.object({
  body: z
    .object({
      email,
      token: recoveryCode,
      newPassword: password,
    })
    .strict(),
});

/* -------------------------------------------------------------------------- */
/*                               QUERY SCHEMAS                                */
/* -------------------------------------------------------------------------- */

export const verifyAccountQuerySchema = z.object({
  query: z.object({
    email,
    token,
  }),
});

/* -------------------------------------------------------------------------- */
/*                              PARAM SCHEMAS                                 */
/* -------------------------------------------------------------------------- */

export const mongoIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB id"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                               PAGINATION                                   */
/* -------------------------------------------------------------------------- */

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});