import { Router } from "express";

import { OrdersController } from "@modules/orders/presentation/orders.controller";

export const createAdminOrdersRouter = (): Router => {
  const router = Router();
  const controller = new OrdersController();

  router.get("/orders", controller.listAdminOrders);
  router.get("/orders/:orderId", controller.getAdminOrder);

  return router;
};

