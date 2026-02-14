import type { NextFunction, Request, Response } from "express";

import {
  authLoginRequestSchema,
  authRegisterRequestSchema,
  forgotPasswordRequestSchema,
  logoutRequestSchema,
  resetPasswordRequestSchema,
  refreshTokenRequestSchema,
  verifyOtpRequestSchema,
} from "@modules/auth/domain/auth.schemas";
import { AuthService } from "@modules/auth/application/auth.service";

const extractRequestContext = (req: Request): { userAgent?: string; ipAddress?: string } => {
  const userAgent = req.header("user-agent") ?? undefined;
  return {
    userAgent,
    ipAddress: req.ip,
  };
};

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = authRegisterRequestSchema.parse(req.body);
      const responseBody = await this.authService.register(payload, extractRequestContext(req));

      res.locals.auditEntityId = responseBody.data.user.id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = authLoginRequestSchema.parse(req.body);
      const responseBody = await this.authService.login(payload, extractRequestContext(req));

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = refreshTokenRequestSchema.parse(req.body);
      const responseBody = await this.authService.refresh(payload, extractRequestContext(req));

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = logoutRequestSchema.parse(req.body);
      await this.authService.logout(payload);

      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = forgotPasswordRequestSchema.parse(req.body);
      const responseBody = await this.authService.forgotPassword(
        payload,
        extractRequestContext(req),
      );

      res.locals.auditEntityId = responseBody.data.challenge_id;
      res.status(202).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = verifyOtpRequestSchema.parse(req.body);
      const responseBody = await this.authService.verifyOtp(
        payload,
        extractRequestContext(req),
      );

      res.locals.auditEntityId = payload.challenge_id;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = resetPasswordRequestSchema.parse(req.body);
      const userId = await this.authService.resetPassword(payload);

      res.locals.auditEntityId = userId;
      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
