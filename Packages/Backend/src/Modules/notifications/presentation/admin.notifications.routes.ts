import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { NotificationsController } from "@modules/notifications/presentation/notifications.controller";

export const createAdminNotificationsRouter = (): Router => {
  const router = Router();
  const controller = new NotificationsController();

  router.get("/notifications/templates", controller.listNotificationTemplates);
  router.put(
    "/notifications/templates/:templateId",
    createAuditMiddleware({
      action: "admin.notifications.template.update",
      entityType: "notification_templates",
      resolveEntityId: (req) => req.params.templateId,
      metadata: (req) => ({
        active: req.body?.active,
        event_key: req.body?.event_key,
        channel: req.body?.channel,
      }),
    }),
    controller.updateNotificationTemplate,
  );

  return router;
};

