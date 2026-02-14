import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { QuotesController } from "@modules/pricing/presentation/quotes.controller";

export const createCommerceQuotesRouter = (): Router => {
  const router = Router();
  const controller = new QuotesController();

  router.use(authenticateAccessTokenMiddleware);

  router.post(
    "/quotes",
    createAuditMiddleware({
      action: "commerce.quote.create",
      entityType: "quotes",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createQuote,
  );

  return router;
};
