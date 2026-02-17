import { randomUUID } from "node:crypto";

import { Prisma, type users } from "@prisma/client";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  ForgotPasswordRequest,
  LogoutRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  VerifyOtpRequest,
} from "@modules/auth/domain/auth.schemas";
import type {
  AuthTokenResponse,
  OtpChallengeResponse,
  OtpVerifyResponse,
  UserSummary,
} from "@modules/auth/domain/auth.types";
import { AuthRepository } from "@modules/auth/infra/auth.repository";
import { OtpDeliveryService } from "@modules/auth/infra/otp-delivery.service";
import { OtpService } from "@modules/auth/infra/otp.service";
import { PasswordService } from "@modules/auth/infra/password.service";
import { TokenService } from "@modules/auth/infra/token.service";

type SessionContext = {
  userAgent?: string;
  ipAddress?: string;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isLoginAllowedStatus = (status: string): boolean => {
  return status === "active";
};

const isDateExpired = (date: Date): boolean => {
  return date.getTime() <= Date.now();
};

const invalidOtpError = (): AppError => {
  return new AppError({
    code: "BAD_REQUEST",
    message: "Invalid or expired OTP.",
    statusCode: 400,
  });
};

const toUserSummary = (user: users): UserSummary => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly passwordService = new PasswordService(),
    private readonly tokenService = new TokenService(),
    private readonly otpService = new OtpService(),
    private readonly otpDeliveryService = new OtpDeliveryService(),
  ) {}

  private async createSession(user: users, sessionContext: SessionContext): Promise<AuthTokenResponse> {
    const accessToken = this.tokenService.issueAccessToken({
      id: user.id,
      role: user.role,
    });
    const refreshToken = this.tokenService.issueRefreshToken({
      id: user.id,
      role: user.role,
    });

    await this.authRepository.createRefreshToken({
      userId: user.id,
      jti: refreshToken.jti,
      tokenHash: this.tokenService.hashRefreshToken(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      userAgent: sessionContext.userAgent,
      ipAddress: sessionContext.ipAddress,
    });

    return {
      success: true,
      data: {
        access_token: accessToken.token,
        refresh_token: refreshToken.token,
        expires_in: accessToken.expiresInSeconds,
        token_type: "Bearer",
        user: toUserSummary(user),
      },
    };
  }

  public async register(
    input: AuthRegisterRequest,
    sessionContext: SessionContext,
  ): Promise<AuthTokenResponse> {
    if (input.role === "admin") {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Admin registration is not allowed in this endpoint.",
        statusCode: 400,
      });
    }

    const email = normalizeEmail(input.email);
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError({
        code: "CONFLICT",
        message: "Email already registered.",
        statusCode: 409,
      });
    }

    const passwordHash = await this.passwordService.hash(input.password);

    try {
      const createdUser = await this.authRepository.createUser({
        name: input.name.trim(),
        email,
        role: input.role,
        passwordHash,
        phoneNumber: input.phone_number?.trim(),
      });

      await this.authRepository.touchLastLogin(createdUser.id);

      return this.createSession(createdUser, sessionContext);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError({
          code: "CONFLICT",
          message: "Email already registered.",
          statusCode: 409,
        });
      }

      throw error;
    }
  }

  public async login(input: AuthLoginRequest, sessionContext: SessionContext): Promise<AuthTokenResponse> {
    const email = normalizeEmail(input.email);
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.password_hash) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
        statusCode: 401,
      });
    }

    // Role is optional: mobile/web may pass it to enforce "Rider" vs "Commerce" login UI.
    // If role is provided and doesn't match, reject.
    if ((input.role && user.role !== input.role) || !isLoginAllowedStatus(user.status)) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
        statusCode: 401,
      });
    }

    const isValidPassword = await this.passwordService.verify(input.password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
        statusCode: 401,
      });
    }

    await this.authRepository.touchLastLogin(user.id);

    return this.createSession(user, sessionContext);
  }

  public async refresh(
    input: RefreshTokenRequest,
    sessionContext: SessionContext,
  ): Promise<AuthTokenResponse> {
    const verifiedRefreshToken = this.tokenService.verifyRefreshToken(input.refresh_token);
    const storedRefreshToken = await this.authRepository.findRefreshTokenByJti(
      verifiedRefreshToken.jti,
    );

    if (!storedRefreshToken) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }

    const isSameTokenHash =
      storedRefreshToken.token_hash === this.tokenService.hashRefreshToken(input.refresh_token);
    const isTokenOwner = storedRefreshToken.user_id === verifiedRefreshToken.userId;
    const isRevoked = storedRefreshToken.revoked_at !== null;
    const isExpired = storedRefreshToken.expires_at.getTime() <= Date.now();

    if (!isSameTokenHash || !isTokenOwner || isRevoked || isExpired) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }

    if (!isLoginAllowedStatus(storedRefreshToken.users.status)) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }

    await this.authRepository.revokeRefreshTokenById(storedRefreshToken.id, "rotated");

    return this.createSession(storedRefreshToken.users, sessionContext);
  }

  public async logout(input: LogoutRequest): Promise<void> {
    const verifiedRefreshToken = this.tokenService.verifyRefreshToken(input.refresh_token);
    const storedRefreshToken = await this.authRepository.findRefreshTokenByJti(
      verifiedRefreshToken.jti,
    );

    if (!storedRefreshToken) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }

    const isSameTokenHash =
      storedRefreshToken.token_hash === this.tokenService.hashRefreshToken(input.refresh_token);
    const isTokenOwner = storedRefreshToken.user_id === verifiedRefreshToken.userId;

    if (!isSameTokenHash || !isTokenOwner) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }

    if (storedRefreshToken.revoked_at === null) {
      await this.authRepository.revokeRefreshTokenById(storedRefreshToken.id, "logout");
    }
  }

  public async forgotPassword(
    input: ForgotPasswordRequest,
    _sessionContext: SessionContext,
  ): Promise<OtpChallengeResponse> {
    const email = normalizeEmail(input.email);
    const currentChallenge = await this.authRepository.findLatestOtpChallengeByEmail(email);

    if (currentChallenge && !isDateExpired(currentChallenge.expires_at)) {
      const elapsedSeconds = Math.floor(
        (Date.now() - currentChallenge.created_at.getTime()) / 1000,
      );
      const resendInSeconds = Math.max(
        0,
        env.otpResendCooldownSeconds - elapsedSeconds,
      );

      if (resendInSeconds > 0 && currentChallenge.verified_at === null) {
        return {
          success: true,
          data: {
            challenge_id: currentChallenge.id,
            expires_at: currentChallenge.expires_at.toISOString(),
            resend_in_seconds: resendInSeconds,
          },
        };
      }
    }

    const user = await this.authRepository.findUserByEmail(email);
    const challengeId = randomUUID();
    const otpCode = this.otpService.generateCode(env.otpCodeLength);
    const otpHash = this.otpService.hashOtp(challengeId, otpCode);
    const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

    await this.authRepository.createOtpChallenge({
      id: challengeId,
      userId: user?.id,
      email,
      otpHash,
      challengeType: "password_reset",
      maxAttempts: env.otpMaxAttempts,
      expiresAt,
    });

    if (user?.id) {
      try {
        await this.otpDeliveryService.sendPasswordResetOtp({
          email,
          otpCode,
          expiresInMinutes: env.otpExpiresMinutes,
        });
      } catch (error: unknown) {
        await this.authRepository.expireOtpChallenge(challengeId);
        throw error;
      }
    }

    return {
      success: true,
      data: {
        challenge_id: challengeId,
        expires_at: expiresAt.toISOString(),
        resend_in_seconds: env.otpResendCooldownSeconds,
      },
    };
  }

  public async verifyOtp(
    input: VerifyOtpRequest,
    sessionContext: SessionContext,
  ): Promise<OtpVerifyResponse> {
    const challenge = await this.authRepository.findOtpChallengeById(input.challenge_id);
    const attemptedCodeHash = this.otpService.hashOtp(input.challenge_id, input.otp);

    if (!challenge || challenge.challenge_type !== "password_reset") {
      throw invalidOtpError();
    }

    if (
      challenge.verified_at !== null ||
      isDateExpired(challenge.expires_at) ||
      challenge.attempts >= challenge.max_attempts
    ) {
      await this.authRepository.createOtpAttempt({
        challengeId: challenge.id,
        attemptedCodeHash,
        success: false,
        userAgent: sessionContext.userAgent,
        ipAddress: sessionContext.ipAddress,
      });
      throw invalidOtpError();
    }

    const isValidOtp = this.otpService.verifyOtp(
      challenge.id,
      input.otp,
      challenge.otp_hash,
    );

    await this.authRepository.createOtpAttempt({
      challengeId: challenge.id,
      attemptedCodeHash,
      success: isValidOtp,
      userAgent: sessionContext.userAgent,
      ipAddress: sessionContext.ipAddress,
    });

    if (!isValidOtp) {
      await this.authRepository.incrementOtpChallengeAttempts(challenge.id);
      throw invalidOtpError();
    }

    if (!challenge.user_id) {
      throw invalidOtpError();
    }

    await this.authRepository.markOtpChallengeVerified(challenge.id);

    const resetToken = this.tokenService.issuePasswordResetToken({
      userId: challenge.user_id,
      challengeId: challenge.id,
    });

    return {
      success: true,
      data: {
        reset_token: resetToken.token,
        expires_at: resetToken.expiresAt.toISOString(),
      },
    };
  }

  public async resetPassword(input: ResetPasswordRequest): Promise<string> {
    const verifiedResetToken = this.tokenService.verifyPasswordResetToken(input.reset_token);
    const challenge = await this.authRepository.findOtpChallengeById(
      verifiedResetToken.challengeId,
    );

    if (
      !challenge ||
      challenge.challenge_type !== "password_reset" ||
      challenge.verified_at === null ||
      isDateExpired(challenge.expires_at) ||
      challenge.user_id !== verifiedResetToken.userId
    ) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid or expired reset token.",
        statusCode: 400,
      });
    }

    const user = await this.authRepository.findUserById(challenge.user_id);
    if (!user) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid or expired reset token.",
        statusCode: 400,
      });
    }

    const passwordHash = await this.passwordService.hash(input.new_password);

    await this.authRepository.updateUserPassword(user.id, passwordHash);
    await this.authRepository.revokeActiveRefreshTokensByUserId(user.id, "password_reset");
    await this.authRepository.expireOtpChallenge(challenge.id);

    return user.id;
  }
}
