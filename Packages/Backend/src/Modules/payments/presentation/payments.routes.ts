import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { PaymentsController } from "@modules/payments/presentation/payments.controller";

export const createCommercePaymentsRouter = (): Router => {
  const router = Router();
  const controller = new PaymentsController();

  router.use(authenticateAccessTokenMiddleware);

  router.post(
    "/credits/purchase-intents",
    createAuditMiddleware({
      action: "payments.credit_purchase_intent.create",
      entityType: "payment_intents",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createCreditPurchaseIntent,
  );

  router.post(
    "/payments/:paymentId/check",
    createAuditMiddleware({
      action: "payments.payment_check.execute",
      entityType: "payment_intents",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.checkCommercePayment,
  );

  return router;
};

export const createPaymentsWebhookRouter = (): Router => {
  const router = Router();
  const controller = new PaymentsController();

  router.post("/infinitepay/webhook", controller.receiveInfinitePayWebhook);

  return router;
};
