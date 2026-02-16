import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "commerce", "rider"]);

const withRoleAlias = <Shape extends z.ZodRawShape>(shape: Shape) => {
  return z
    .object({
      ...shape,
      role: userRoleSchema.optional(),
      context: userRoleSchema.optional(),
    })
    .superRefine((value, ctx) => {
      if (!value.role && !value.context) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["role"],
          message: "role is required.",
        });
      }
    })
    .transform(({ context, role, ...rest }) => ({
      ...rest,
      role: role ?? context!,
    }));
};

export const authRegisterRequestSchema = withRoleAlias({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  phone_number: z.string().trim().min(8).max(30).optional(),
});

export const authLoginRequestSchema = withRoleAlias({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const refreshTokenRequestSchema = z.object({
  refresh_token: z.string().trim().min(1),
});

export const logoutRequestSchema = z.object({
  refresh_token: z.string().trim().min(1),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyOtpRequestSchema = z.object({
  challenge_id: z.string().uuid(),
  otp: z.string().trim().min(4).max(8),
});

export const resetPasswordRequestSchema = z.object({
  reset_token: z.string().trim().min(1),
  new_password: z.string().min(8),
});

export type AuthRegisterRequest = z.infer<typeof authRegisterRequestSchema>;
export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
