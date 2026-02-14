import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import { orderIdParamSchema } from "@modules/orders/domain/orders.schemas";
import { TrackingService } from "@modules/tracking/application/tracking.service";
import { riderOrderEventRequestSchema } from "@modules/tracking/domain/tracking.schemas";

export class TrackingController {
  constructor(private readonly trackingService = new TrackingService()) {}

  public getAdminTracking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.trackingService.getAdminOrderTracking({
        orderId: params.orderId,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getCommerceTracking = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can access order tracking.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.trackingService.getCommerceOrderTracking({
        commerceUserId: authContext.userId,
        orderId: params.orderId,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getConfirmationCode = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "commerce") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only commerce users can access confirmation codes.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const responseBody = await this.trackingService.getOrderConfirmationCode({
        commerceUserId: authContext.userId,
        orderId: params.orderId,
      });

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public appendRiderOrderEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can append order events.",
          statusCode: 403,
        });
      }

      const params = orderIdParamSchema.parse(req.params);
      const payload = riderOrderEventRequestSchema.parse(req.body);
      const responseBody = await this.trackingService.appendRiderOrderEvent({
        riderUserId: authContext.userId,
        orderId: params.orderId,
        payload,
      });

      res.locals.auditEntityId = params.orderId;
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
