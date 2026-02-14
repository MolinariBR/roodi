import type { NextFunction, Request, Response } from "express";

import { getAuthContext } from "@core/http/middlewares/authenticate";
import { pricingRulesUpdateRequestSchema } from "@modules/pricing/domain/admin.schemas";
import { PricingAdminService } from "@modules/pricing/application/pricing-admin.service";

export class PricingAdminController {
  constructor(private readonly pricingAdminService = new PricingAdminService()) {}

  public getPricingRules = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const responseBody = await this.pricingAdminService.getPricingRules();
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public updatePricingRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authContext = getAuthContext(res);
      const payload = pricingRulesUpdateRequestSchema.parse(req.body);
      const responseBody = await this.pricingAdminService.updatePricingRules({
        payload,
        adminUserId: authContext.userId,
      });

      res.locals.auditEntityId = "active";
      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}

