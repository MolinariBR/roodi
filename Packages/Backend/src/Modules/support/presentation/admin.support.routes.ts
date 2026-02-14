import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { SupportController } from "@modules/support/presentation/support.controller";

export const createAdminSupportRouter = (): Router => {
  const router = Router();
  const controller = new SupportController();

  router.get("/support/tickets", controller.listAdminSupportTickets);
  router.patch(
    "/support/tickets/:ticketId",
    createAuditMiddleware({
      action: "admin.support.ticket.update",
      entityType: "support_tickets",
      resolveEntityId: (req) => req.params.ticketId,
      metadata: (req) => ({
        status: req.body?.status,
        assigned_to_user_id: req.body?.assigned_to_user_id,
        note: req.body?.note,
      }),
    }),
    controller.updateAdminSupportTicket,
  );

  return router;
};

