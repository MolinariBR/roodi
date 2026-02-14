import { Router } from "express";

import { SystemController } from "@modules/system/presentation/system.controller";

export const createSystemRouter = (): Router => {
  const router = Router();
  const controller = new SystemController();

  router.get("/status", controller.getStatus);

  return router;
};
