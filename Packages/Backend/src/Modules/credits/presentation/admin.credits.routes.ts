import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { CreditsController } from "@modules/credits/presentation/credits.controller";

export const createAdminCreditsRouter = (): Router => {
  const router = Router();
  const controller = new CreditsController();

  router.get("/credits/ledger", controller.listAdminLedger);
  router.post(
    "/credits/adjustments",
    createAuditMiddleware({
      action: "admin.credits.adjustment.create",
      entityType: "credits_ledger",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
      metadata: (req) => ({
        commerce_id: req.body?.commerce_id,
        amount_brl: req.body?.amount_brl,
        reason: req.body?.reason,
      }),
    }),
    controller.createAdminAdjustment,
  );

  return router;
};

