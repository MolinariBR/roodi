import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { TrackingController } from "@modules/tracking/presentation/tracking.controller";

export const createCommerceTrackingRouter = (): Router => {
  const router = Router();
  const controller = new TrackingController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/orders/:orderId/tracking", controller.getCommerceTracking);
  router.get("/orders/:orderId/confirmation-code", controller.getConfirmationCode);

  return router;
};

export const createRiderTrackingRouter = (): Router => {
  const router = Router();
  const controller = new TrackingController();

  router.use(authenticateAccessTokenMiddleware);

  router.post(
    "/orders/:orderId/events",
    createAuditMiddleware({
      action: "rider.order.event.append",
      entityType: "orders",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.appendRiderOrderEvent,
  );

  return router;
};
