import { Router } from "express";

import { PaymentsController } from "@modules/payments/presentation/payments.controller";

export const createAdminPaymentsRouter = (): Router => {
  const router = Router();
  const controller = new PaymentsController();

  router.get("/payments/transactions", controller.listAdminPaymentTransactions);
  router.get("/payments/transactions/:transactionId", controller.getAdminPaymentTransaction);

  return router;
};

