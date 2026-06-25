import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                              Reusable Fields                               */
/* -------------------------------------------------------------------------- */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

export const fullnameSchema = z
  .string()
  .trim()
  .min(3, "Full name must be at least 3 characters")
  .max(50, "Full name cannot exceed 50 characters")
  .transform((value) => value.replace(/\s+/g, " "));

export const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Invalid phone number"
      )
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password cannot exceed 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required");

export const tokenSchema = z
  .string()
  .trim()
  .min(1, "Token is required");

export const recoveryCodeSchema = z
  .string()
  .trim()
  .min(6, "Recovery code is required");

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/* -------------------------------------------------------------------------- */
/*                                 REGISTER                                   */
/* -------------------------------------------------------------------------- */

export const registerSchema = z.object({
  fullname: fullnameSchema,
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  password: passwordSchema,
});

/* -------------------------------------------------------------------------- */
/*                              FORGOT PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/* -------------------------------------------------------------------------- */
/*                              RESET PASSWORD                                */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z.object({
  email: emailSchema,
  token: tokenSchema,
  newPassword: passwordSchema,
});

/* -------------------------------------------------------------------------- */
/*                             RECOVER ACCOUNT                                */
/* -------------------------------------------------------------------------- */

export const recoverAccountSchema = z.object({
  email: emailSchema,
  token: recoveryCodeSchema,
  newPassword: passwordSchema,
});

/* -------------------------------------------------------------------------- */
/*                             CHANGE PASSWORD                                */
/* -------------------------------------------------------------------------- */

export const changePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    newPassword: passwordSchema,
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      path: ["newPassword"],
      message:
        "New password must be different from current password",
    }
  );

/* -------------------------------------------------------------------------- */
/*                             VERIFY ACCOUNT                                 */
/* -------------------------------------------------------------------------- */

export const verifyAccountSchema = z.object({
  email: emailSchema,
  token: tokenSchema,
});

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type LoginForm = z.infer<typeof loginSchema>;

export type RegisterForm = z.infer<typeof registerSchema>;

export type ForgotPasswordForm = z.infer<
  typeof forgotPasswordSchema
>;

export type ResetPasswordForm = z.infer<
  typeof resetPasswordSchema
>;

export type RecoverAccountForm = z.infer<
  typeof recoverAccountSchema
>;

export type ChangePasswordForm = z.infer<
  typeof changePasswordSchema
>;

export type VerifyAccountForm = z.infer<
  typeof verifyAccountSchema
>;