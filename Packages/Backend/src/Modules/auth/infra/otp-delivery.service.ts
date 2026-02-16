import { AppError } from "@core/http/errors/app-error";
import { logger } from "@core/observability/logger";
import { env } from "@core/config/env";

type PasswordResetOtpDeliveryInput = {
  email: string;
  otpCode: string;
  expiresInMinutes: number;
};

type OtpDeliveryProvider = {
  sendPasswordResetOtp: (input: PasswordResetOtpDeliveryInput) => Promise<void>;
};

class ResendOtpDeliveryProvider implements OtpDeliveryProvider {
  public async sendPasswordResetOtp(input: PasswordResetOtpDeliveryInput): Promise<void> {
    if (!env.resendApiKey || !env.resendFromEmail) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "OTP provider is not configured.",
        statusCode: 503,
      });
    }

    const endpoint = new URL("/emails", env.resendApiBaseUrl);
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.resendFromEmail,
        to: [input.email],
        ...(env.resendReplyTo ? { reply_to: env.resendReplyTo } : {}),
        subject: "Codigo de recuperacao de senha - Roodi",
        text: `Seu codigo OTP e ${input.otpCode}. Ele expira em ${input.expiresInMinutes} minutos.`,
      }),
    });

    if (response.ok) {
      return;
    }

    const responseBody = await response.text().catch(() => "");
    logger.error(
      {
        status_code: response.status,
        response_body: responseBody,
      },
      "otp_resend_delivery_failed",
    );

    throw new AppError({
      code: "SERVICE_UNAVAILABLE",
      message: "Unable to deliver OTP right now.",
      statusCode: 503,
    });
  }
}

class DevelopmentOtpLogProvider implements OtpDeliveryProvider {
  public async sendPasswordResetOtp(input: PasswordResetOtpDeliveryInput): Promise<void> {
    logger.info(
      {
        email: input.email,
        otp_code: input.otpCode,
        expires_in_minutes: input.expiresInMinutes,
      },
      "otp_password_reset_generated_development",
    );
  }
}

const resolveOtpDeliveryProvider = (): OtpDeliveryProvider => {
  if (env.resendApiKey && env.resendFromEmail) {
    return new ResendOtpDeliveryProvider();
  }

  if (env.nodeEnv === "production") {
    return new ResendOtpDeliveryProvider();
  }

  return new DevelopmentOtpLogProvider();
};

export class OtpDeliveryService {
  constructor(private readonly provider: OtpDeliveryProvider = resolveOtpDeliveryProvider()) {}

  public sendPasswordResetOtp(input: PasswordResetOtpDeliveryInput): Promise<void> {
    return this.provider.sendPasswordResetOtp(input);
  }
}
