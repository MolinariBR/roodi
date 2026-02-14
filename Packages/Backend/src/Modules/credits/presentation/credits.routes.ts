import { Router } from "express";

import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { CreditsController } from "@modules/credits/presentation/credits.controller";

export const createCommerceCreditsRouter = (): Router => {
  const router = Router();
  const controller = new CreditsController();

  router.use(authenticateAccessTokenMiddleware);
  router.get("/credits/balance", controller.getBalance);
  router.get("/credits/ledger", controller.listLedger);

  return router;
};
