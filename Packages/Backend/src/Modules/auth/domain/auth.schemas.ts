import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "commerce", "rider"]);

export const authRegisterRequestSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: userRoleSchema,
  phone_number: z.string().trim().min(8).max(30).optional(),
});

export const authLoginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: userRoleSchema,
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
