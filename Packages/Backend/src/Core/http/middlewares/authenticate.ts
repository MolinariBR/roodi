import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { TokenService } from "@modules/auth/infra/token.service";

type AuthContext = {
  userId: string;
  role: "admin" | "commerce" | "rider";
};

const tokenService = new TokenService();

const parseBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Missing authorization token.",
      statusCode: 401,
    });
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Invalid authorization header.",
      statusCode: 401,
    });
  }

  return token;
};

export const authenticateAccessTokenMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawToken = parseBearerToken(req.header("authorization"));
    const verifiedToken = tokenService.verifyAccessToken(rawToken);

    res.locals.auth = {
      userId: verifiedToken.userId,
      role: verifiedToken.role,
    } satisfies AuthContext;

    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const getAuthContext = (res: Response): AuthContext => {
  const authContext = res.locals.auth as AuthContext | undefined;
  if (!authContext) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Unauthorized request.",
      statusCode: 401,
    });
  }

  return authContext;
};
