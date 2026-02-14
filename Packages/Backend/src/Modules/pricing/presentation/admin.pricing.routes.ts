import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { PricingAdminController } from "@modules/pricing/presentation/admin.pricing.controller";

export const createAdminPricingRouter = (): Router => {
  const router = Router();
  const controller = new PricingAdminController();

  router.get("/pricing/rules", controller.getPricingRules);
  router.put(
    "/pricing/rules",
    createAuditMiddleware({
      action: "admin.pricing.rules.update",
      entityType: "pricing_rule_versions",
      resolveEntityId: () => "active",
      metadata: (req) => ({
        minimum_charge_brl: req.body?.minimum_charge_brl,
        max_distance_km: req.body?.max_distance_km,
      }),
    }),
    controller.updatePricingRules,
  );

  return router;
};

