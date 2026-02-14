import { Router } from "express";

import { TrackingController } from "@modules/tracking/presentation/tracking.controller";

export const createAdminTrackingRouter = (): Router => {
  const router = Router();
  const controller = new TrackingController();

  router.get("/tracking/orders/:orderId", controller.getAdminTracking);

  return router;
};

