import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { PublicController } from "@modules/public/presentation/public.controller";

export const createPublicRouter = (): Router => {
  const router = Router();
  const controller = new PublicController();

  router.post(
    "/leads",
    createAuditMiddleware({
      action: "public.lead.create",
      entityType: "public_leads",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createLead,
  );

  router.get("/legal/:documentType", controller.getLegalDocument);

  return router;
};
