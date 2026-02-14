import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import {
  adminUserIdParamSchema,
  adminUserListQuerySchema,
  adminUserStatusUpdateRequestSchema,
} from "@modules/users/domain/admin.schemas";
import {
  notificationSettingsUpdateRequestSchema,
  userProfileUpdateRequestSchema,
} from "@modules/users/domain/me.schemas";
import { UsersService } from "@modules/users/application/users.service";

export class UsersController {
  constructor(private readonly usersService = new UsersService()) {}

  public listAdminUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = adminUserListQuerySchema.parse(req.query);
      const responseBody = await this.usersService.listAdminUsers(query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateAdminUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params = adminUserIdParamSchema.parse(req.params);
      const payload = adminUserStatusUpdateRequestSchema.parse(req.body);
      const responseBody = await this.usersService.updateAdminUserStatus({
        userId: params.userId,
        status: payload.status,
      });

      res.locals.auditEntityId = params.userId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getMe = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const responseBody = await this.usersService.getMe(authContext.userId);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public patchMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = userProfileUpdateRequestSchema.parse(req.body);
      const responseBody = await this.usersService.updateMe(authContext.userId, payload);

      res.locals.auditEntityId = authContext.userId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getMyNotificationSettings = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const responseBody = await this.usersService.getMyNotificationSettings(
        authContext.userId,
      );

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public patchMyNotificationSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = notificationSettingsUpdateRequestSchema.parse(req.body);
      const responseBody = await this.usersService.updateMyNotificationSettings(
        authContext.userId,
        payload,
      );

      res.locals.auditEntityId = authContext.userId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
