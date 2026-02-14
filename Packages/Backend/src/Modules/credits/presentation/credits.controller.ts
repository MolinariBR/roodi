import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import { creditsLedgerQuerySchema, adminCreditAdjustmentRequestSchema } from "@modules/credits/domain/credits.schemas";
import { CreditsService } from "@modules/credits/application/credits.service";

export class CreditsController {
  constructor(private readonly creditsService = new CreditsService()) {}

  public getBalance = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const responseBody = await this.creditsService.getBalance(authContext.userId);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listLedger = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const query = creditsLedgerQuerySchema.parse(req.query);
      const responseBody = await this.creditsService.listLedger(authContext.userId, query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public listAdminLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = creditsLedgerQuerySchema.parse(req.query);
      const responseBody = await this.creditsService.listAdminLedger(query);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public createAdminAdjustment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = adminCreditAdjustmentRequestSchema.parse(req.body);
      const responseBody = await this.creditsService.createAdminAdjustment({
        adminUserId: authContext.userId,
        payload,
      });

      res.locals.auditEntityId = responseBody.data.adjustment_id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
