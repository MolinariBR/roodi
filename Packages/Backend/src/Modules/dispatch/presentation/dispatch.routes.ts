import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { DispatchController } from "@modules/dispatch/presentation/dispatch.controller";

export const createRiderDispatchRouter = (): Router => {
  const router = Router();
  const controller = new DispatchController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/offers/current", controller.getCurrentOffer);
  router.post(
    "/offers/:offerId/accept",
    createAuditMiddleware({
      action: "rider.offer.accept",
      entityType: "dispatch_offers",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.acceptOffer,
  );
  router.post(
    "/offers/:offerId/reject",
    createAuditMiddleware({
      action: "rider.offer.reject",
      entityType: "dispatch_offers",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.rejectOffer,
  );

  return router;
};
