import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { UsersController } from "@modules/users/presentation/users.controller";

export const createUsersRouter = (): Router => {
  const router = Router();
  const controller = new UsersController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/", controller.getMe);
  router.patch(
    "/",
    createAuditMiddleware({
      action: "users.profile.update",
      entityType: "users",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.patchMe,
  );
  router.get("/settings/notifications", controller.getMyNotificationSettings);
  router.patch(
    "/settings/notifications",
    createAuditMiddleware({
      action: "users.notification_settings.update",
      entityType: "user_notification_settings",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.patchMyNotificationSettings,
  );

  return router;
};
