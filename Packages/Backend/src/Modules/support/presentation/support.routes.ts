import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { SupportController } from "@modules/support/presentation/support.controller";

export const createSupportRouter = (): Router => {
  const router = Router();
  const controller = new SupportController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/faqs", controller.listFaqs);
  router.get("/tickets", controller.listSupportTickets);
  router.post(
    "/tickets",
    createAuditMiddleware({
      action: "support.ticket.create",
      entityType: "support_tickets",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string"
          ? res.locals.auditEntityId
          : undefined;
      },
    }),
    controller.createSupportTicket,
  );
  router.get("/tickets/:ticketId", controller.getSupportTicket);

  return router;
};
