import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";

type UserRole = "admin" | "commerce" | "rider";

export const requireRoleMiddleware = (roles: readonly UserRole[]): RequestHandler => {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      const authContext = getAuthContext(res);

      if (!roles.includes(authContext.role)) {
        throw new AppError({
          code: "FORBIDDEN",
          message: "User does not have permission to access this resource.",
          statusCode: 403,
        });
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};

export const requireAdminMiddleware: RequestHandler = requireRoleMiddleware(["admin"]);

