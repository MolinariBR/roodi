import type {
  Prisma,
  PrismaClient,
  auth_otp_challenges,
  user_role,
  users,
} from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";

type CreateUserInput = {
  name: string;
  email: string;
  role: user_role;
  passwordHash: string;
  phoneNumber?: string;
};

type CreateRefreshTokenInput = {
  userId: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};

type RefreshTokenWithUser = Prisma.auth_refresh_tokensGetPayload<{
  include: {
    users: true;
  };
}>;

type OtpChallengeInput = {
  id: string;
  userId?: string;
  email: string;
  otpHash: string;
  challengeType: string;
  maxAttempts: number;
  expiresAt: Date;
};

type OtpAttemptInput = {
  challengeId: string;
  attemptedCodeHash: string;
  success: boolean;
  userAgent?: string;
  ipAddress?: string;
};

const normalizeIpAddress = (ipAddress: string | undefined): string | undefined => {
  if (!ipAddress) {
    return undefined;
  }

  if (ipAddress === "::1") {
    return "127.0.0.1";
  }

  return ipAddress.startsWith("::ffff:") ? ipAddress.replace("::ffff:", "") : ipAddress;
};

export class AuthRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findUserByEmail(email: string): Promise<users | null> {
    return this.prismaClient.users.findUnique({
      where: { email },
    });
  }

  public findUserById(userId: string): Promise<users | null> {
    return this.prismaClient.users.findUnique({
      where: { id: userId },
    });
  }

  public async createUser(input: CreateUserInput): Promise<users> {
    return this.prismaClient.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          role: input.role,
          status: "active",
          name: input.name,
          email: input.email,
          password_hash: input.passwordHash,
          phone_number: input.phoneNumber,
          whatsapp: input.phoneNumber,
          profile_picture_url: null,
        },
      });

      await tx.user_identities.create({
        data: {
          user_id: user.id,
          provider: "local",
          provider_user_id: `local:${user.email}`,
          provider_email: user.email,
        },
      });

      await tx.user_notification_settings.create({
        data: {
          user_id: user.id,
          delivery: true,
          payment: true,
          promotions: false,
          app_updates: true,
          security: true,
          support: true,
        },
      });

      return user;
    });
  }

  public async touchLastLogin(userId: string): Promise<void> {
    await this.prismaClient.users.update({
      where: { id: userId },
      data: {
        last_login_at: new Date(),
      },
    });
  }

  public async createRefreshToken(input: CreateRefreshTokenInput): Promise<void> {
    await this.prismaClient.auth_refresh_tokens.create({
      data: {
        user_id: input.userId,
        jti: input.jti,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
        user_agent: input.userAgent,
        ip_address: normalizeIpAddress(input.ipAddress),
      },
    });
  }

  public findRefreshTokenByJti(jti: string): Promise<RefreshTokenWithUser | null> {
    return this.prismaClient.auth_refresh_tokens.findUnique({
      where: { jti },
      include: {
        users: true,
      },
    });
  }

  public async revokeRefreshTokenById(tokenId: string, revokedReason: string): Promise<void> {
    await this.prismaClient.auth_refresh_tokens.update({
      where: { id: tokenId },
      data: {
        revoked_at: new Date(),
        revoked_reason: revokedReason,
      },
    });
  }

  public findLatestOtpChallengeByEmail(email: string): Promise<auth_otp_challenges | null> {
    return this.prismaClient.auth_otp_challenges.findFirst({
      where: {
        email,
        challenge_type: "password_reset",
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  public async createOtpChallenge(input: OtpChallengeInput): Promise<auth_otp_challenges> {
    return this.prismaClient.auth_otp_challenges.create({
      data: {
        id: input.id,
        user_id: input.userId,
        email: input.email,
        otp_hash: input.otpHash,
        challenge_type: input.challengeType,
        max_attempts: input.maxAttempts,
        attempts: 0,
        resend_count: 0,
        expires_at: input.expiresAt,
      },
    });
  }

  public findOtpChallengeById(challengeId: string): Promise<auth_otp_challenges | null> {
    return this.prismaClient.auth_otp_challenges.findUnique({
      where: { id: challengeId },
    });
  }

  public async createOtpAttempt(input: OtpAttemptInput): Promise<void> {
    await this.prismaClient.auth_otp_attempts.create({
      data: {
        challenge_id: input.challengeId,
        attempted_code: input.attemptedCodeHash,
        success: input.success,
        ip_address: normalizeIpAddress(input.ipAddress),
        user_agent: input.userAgent,
      },
    });
  }

  public async incrementOtpChallengeAttempts(challengeId: string): Promise<void> {
    await this.prismaClient.auth_otp_challenges.update({
      where: { id: challengeId },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  public async markOtpChallengeVerified(challengeId: string): Promise<void> {
    await this.prismaClient.auth_otp_challenges.update({
      where: { id: challengeId },
      data: {
        verified_at: new Date(),
      },
    });
  }

  public async expireOtpChallenge(challengeId: string): Promise<void> {
    await this.prismaClient.auth_otp_challenges.update({
      where: { id: challengeId },
      data: {
        expires_at: new Date(),
      },
    });
  }

  public async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prismaClient.users.update({
      where: { id: userId },
      data: {
        password_hash: passwordHash,
      },
    });
  }

  public async revokeActiveRefreshTokensByUserId(
    userId: string,
    revokedReason: string,
  ): Promise<void> {
    await this.prismaClient.auth_refresh_tokens.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
        revoked_reason: revokedReason,
      },
    });
  }
}
