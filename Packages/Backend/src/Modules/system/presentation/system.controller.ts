import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import { SystemService } from "@modules/system/application/system.service";
import {
  systemFlagKeyParamSchema,
  systemFlagUpdateRequestSchema,
  systemMaintenanceUpdateRequestSchema,
} from "@modules/system/domain/system.schemas";

export class SystemController {
  constructor(private readonly systemService = new SystemService()) {}

  public getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.systemService.getStatus();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getAdminDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.systemService.getAdminDashboard();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listSystemFlags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.systemService.listSystemFlags();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updateSystemFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const params = systemFlagKeyParamSchema.parse(req.params);
      const payload = systemFlagUpdateRequestSchema.parse(req.body);
      const responseBody = await this.systemService.updateSystemFlag({
        flagKey: params.flagKey,
        payload,
        updatedByUserId: authContext.userId,
      });

      res.locals.auditEntityId = params.flagKey;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getMaintenanceStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.systemService.getMaintenanceStatus();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public setMaintenanceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = systemMaintenanceUpdateRequestSchema.parse(req.body);
      const responseBody = await this.systemService.setMaintenanceStatus({
        payload,
        updatedByUserId: authContext.userId,
      });

      res.locals.auditEntityId = "global";
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
