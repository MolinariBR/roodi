import type { user_role, user_status } from "@prisma/client";

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: user_role;
  status: user_status;
};

export type AuthTokenPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer";
  user: UserSummary;
};

export type AuthTokenResponse = {
  success: true;
  data: AuthTokenPayload;
};

export type OtpChallengeResponse = {
  success: true;
  data: {
    challenge_id: string;
    expires_at: string;
    resend_in_seconds: number;
  };
};

export type OtpVerifyResponse = {
  success: true;
  data: {
    reset_token: string;
    expires_at: string;
  };
};
