import type { NextFunction, Request, Response } from "express";

import { AppError } from "@core/http/errors/app-error";
import { getAuthContext } from "@core/http/middlewares/authenticate";
import {
  offerIdParamSchema,
  rejectOfferRequestSchema,
} from "@modules/dispatch/domain/dispatch.schemas";
import { DispatchService } from "@modules/dispatch/application/dispatch.service";

export class DispatchController {
  constructor(private readonly dispatchService = new DispatchService()) {}

  public getCurrentOffer = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can access offers.",
          statusCode: 403,
        });
      }

      const offer = await this.dispatchService.getCurrentOffer(authContext.userId);
      if (!offer) {
        res.status(204).send();
        return;
      }

      res.status(200).json(offer);
    } catch (error: unknown) {
      next(error);
    }
  };

  public acceptOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can accept offers.",
          statusCode: 403,
        });
      }

      const params = offerIdParamSchema.parse(req.params);
      const order = await this.dispatchService.acceptOffer({
        offerId: params.offerId,
        riderUserId: authContext.userId,
      });

      res.locals.auditEntityId = params.offerId;
      res.status(200).json(order);
    } catch (error: unknown) {
      next(error);
    }
  };

  public rejectOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      if (authContext.role !== "rider") {
        throw new AppError({
          code: "FORBIDDEN",
          message: "Only rider users can reject offers.",
          statusCode: 403,
        });
      }

      const params = offerIdParamSchema.parse(req.params);
      const payload = rejectOfferRequestSchema.parse(req.body);

      await this.dispatchService.rejectOffer({
        offerId: params.offerId,
        riderUserId: authContext.userId,
        reason: payload?.reason,
      });

      res.locals.auditEntityId = params.offerId;
      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
