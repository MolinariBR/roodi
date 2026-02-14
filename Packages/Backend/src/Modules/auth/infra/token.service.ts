import { createHmac, randomUUID } from "node:crypto";

import type { user_role } from "@prisma/client";
import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";

type AccessTokenResult = {
  token: string;
  expiresInSeconds: number;
};

type RefreshTokenResult = {
  token: string;
  jti: string;
  expiresAt: Date;
};

type VerifiedRefreshToken = {
  userId: string;
  jti: string;
};

type VerifiedAccessToken = {
  userId: string;
  role: user_role;
};

type PasswordResetTokenResult = {
  token: string;
  expiresAt: Date;
};

type VerifiedPasswordResetToken = {
  userId: string;
  challengeId: string;
};

type IssueTokenInput = {
  payload: Record<string, unknown>;
  subject: string;
  secret: Secret;
  expiresIn: string;
  jti: string;
};

const isJwtPayload = (value: unknown): value is JwtPayload => {
  return typeof value === "object" && value !== null;
};

const normalizeJwtExpiry = (
  decodedToken: string | JwtPayload | null,
): { exp: number; iat: number } => {
  if (!isJwtPayload(decodedToken) || typeof decodedToken.exp !== "number") {
    throw new Error("Issued token is missing valid exp claim.");
  }

  const iat = typeof decodedToken.iat === "number" ? decodedToken.iat : Math.floor(Date.now() / 1000);
  return { exp: decodedToken.exp, iat };
};

export class TokenService {
  private issueToken(input: IssueTokenInput): { token: string; exp: number; iat: number } {
    const signOptions: SignOptions = {
      subject: input.subject,
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      expiresIn: input.expiresIn as SignOptions["expiresIn"],
      jwtid: input.jti,
    };

    const token = jwt.sign(input.payload, input.secret, signOptions);
    const decodedToken = jwt.decode(token);
    const { exp, iat } = normalizeJwtExpiry(decodedToken);

    return { token, exp, iat };
  }

  public issueAccessToken(user: { id: string; role: user_role }): AccessTokenResult {
    const { token, exp, iat } = this.issueToken({
      payload: {
        role: user.role,
      },
      subject: user.id,
      secret: env.jwtAccessSecret,
      expiresIn: env.jwtAccessExpiresIn,
      jti: randomUUID(),
    });

    return {
      token,
      expiresInSeconds: Math.max(1, exp - iat),
    };
  }

  public issueRefreshToken(user: { id: string; role: user_role }): RefreshTokenResult {
    const jti = randomUUID();
    const { token, exp } = this.issueToken({
      payload: {
        role: user.role,
        token_type: "refresh",
      },
      subject: user.id,
      secret: env.jwtRefreshSecret,
      expiresIn: env.jwtRefreshExpiresIn,
      jti,
    });

    return {
      token,
      jti,
      expiresAt: new Date(exp * 1000),
    };
  }

  public verifyRefreshToken(rawRefreshToken: string): VerifiedRefreshToken {
    try {
      const verified = jwt.verify(rawRefreshToken, env.jwtRefreshSecret, {
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
      });

      if (!isJwtPayload(verified) || typeof verified.sub !== "string" || typeof verified.jti !== "string") {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token.",
          statusCode: 401,
        });
      }

      return {
        userId: verified.sub,
        jti: verified.jti,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token.",
        statusCode: 401,
      });
    }
  }

  public verifyAccessToken(rawAccessToken: string): VerifiedAccessToken {
    try {
      const verified = jwt.verify(rawAccessToken, env.jwtAccessSecret, {
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
      });

      if (!isJwtPayload(verified) || typeof verified.sub !== "string" || typeof verified.role !== "string") {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Invalid access token.",
          statusCode: 401,
        });
      }

      const tokenType =
        typeof verified.token_type === "string" ? verified.token_type : undefined;
      if (tokenType !== undefined) {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Invalid access token.",
          statusCode: 401,
        });
      }

      if (verified.role !== "admin" && verified.role !== "commerce" && verified.role !== "rider") {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Invalid access token.",
          statusCode: 401,
        });
      }

      return {
        userId: verified.sub,
        role: verified.role,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid access token.",
        statusCode: 401,
      });
    }
  }

  public issuePasswordResetToken(input: {
    userId: string;
    challengeId: string;
  }): PasswordResetTokenResult {
    const { token, exp } = this.issueToken({
      payload: {
        token_type: "password_reset",
        challenge_id: input.challengeId,
      },
      subject: input.userId,
      secret: env.jwtAccessSecret,
      expiresIn: `${env.otpExpiresMinutes}m`,
      jti: randomUUID(),
    });

    return {
      token,
      expiresAt: new Date(exp * 1000),
    };
  }

  public verifyPasswordResetToken(rawResetToken: string): VerifiedPasswordResetToken {
    try {
      const verified = jwt.verify(rawResetToken, env.jwtAccessSecret, {
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
      });

      if (!isJwtPayload(verified)) {
        throw new AppError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
          statusCode: 400,
        });
      }

      const userId = typeof verified.sub === "string" ? verified.sub : undefined;
      const challengeId =
        typeof verified.challenge_id === "string" ? verified.challenge_id : undefined;
      const tokenType = typeof verified.token_type === "string" ? verified.token_type : undefined;

      if (!userId || !challengeId || tokenType !== "password_reset") {
        throw new AppError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
          statusCode: 400,
        });
      }

      return {
        userId,
        challengeId,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid or expired reset token.",
        statusCode: 400,
      });
    }
  }

  public hashRefreshToken(rawRefreshToken: string): string {
    return createHmac("sha256", env.jwtRefreshSecret).update(rawRefreshToken).digest("hex");
  }
}
