import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
  notificationTemplateUpdateRequestSchema,
  templateIdParamSchema,
} from "@modules/notifications/domain/notifications.schemas";
import { NotificationsService } from "@modules/notifications/application/notifications.service";

export class NotificationsController {
  constructor(private readonly notificationsService = new NotificationsService()) {}

  public listNotificationTemplates = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const responseBody = await this.notificationsService.listNotificationTemplates();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateNotificationTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = templateIdParamSchema.parse(req.params);
      const payload = notificationTemplateUpdateRequestSchema.parse(req.body);
      const responseBody = await this.notificationsService.updateNotificationTemplate({
        templateId: params.templateId,
        payload,
        adminUserId: authContext.userId,
      });

      res.locals.auditEntityId = params.templateId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const query = notificationListQuerySchema.parse(req.query);
      const responseBody = await this.notificationsService.listNotifications(
        authContext.userId,
        query,
      );

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public markNotificationRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = notificationIdParamSchema.parse(req.params);
      const responseBody = await this.notificationsService.markNotificationRead(
        authContext.userId,
        params.notificationId,
      );

      res.locals.auditEntityId = params.notificationId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public markAllNotificationsRead = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      await this.notificationsService.markAllNotificationsRead(authContext.userId);

      res.locals.auditEntityId = authContext.userId;
      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
