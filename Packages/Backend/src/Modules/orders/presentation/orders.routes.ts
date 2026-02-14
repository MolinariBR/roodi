import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { OrdersController } from "@modules/orders/presentation/orders.controller";

export const createCommerceOrdersRouter = (): Router => {
  const router = Router();
  const controller = new OrdersController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/orders", controller.listCommerceOrders);
  router.post(
    "/orders",
    createAuditMiddleware({
      action: "commerce.order.create",
      entityType: "orders",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createCommerceOrder,
  );
  router.get("/orders/:orderId", controller.getCommerceOrder);
  router.post(
    "/orders/:orderId/cancel",
    createAuditMiddleware({
      action: "commerce.order.cancel",
      entityType: "orders",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.cancelCommerceOrder,
  );

  return router;
};

export const createRiderOrdersRouter = (): Router => {
  const router = Router();
  const controller = new OrdersController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/orders/active", controller.getRiderActiveOrder);
  router.get("/orders/history", controller.listRiderOrderHistory);
  router.get("/orders/:orderId", controller.getRiderOrder);

  return router;
};
