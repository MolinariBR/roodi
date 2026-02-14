import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { NotificationsController } from "@modules/notifications/presentation/notifications.controller";

export const createNotificationsRouter = (): Router => {
  const router = Router();
  const controller = new NotificationsController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/", controller.listNotifications);
  router.post(
    "/mark-all-read",
    createAuditMiddleware({
      action: "notifications.mark_all_read",
      entityType: "notifications",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.markAllNotificationsRead,
  );
  router.patch(
    "/:notificationId/read",
    createAuditMiddleware({
      action: "notifications.mark_read",
      entityType: "notifications",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.markNotificationRead,
  );

  return router;
};
