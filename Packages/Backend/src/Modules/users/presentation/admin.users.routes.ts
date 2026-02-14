import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { UsersController } from "@modules/users/presentation/users.controller";

export const createAdminUsersRouter = (): Router => {
  const router = Router();
  const controller = new UsersController();

  router.get("/users", controller.listAdminUsers);
  router.patch(
    "/users/:userId/status",
    createAuditMiddleware({
      action: "admin.users.status.update",
      entityType: "users",
      resolveEntityId: (req) => req.params.userId,
      metadata: (req) => ({
        next_status: typeof req.body?.status === "string" ? req.body.status : undefined,
        reason: typeof req.body?.reason === "string" ? req.body.reason : undefined,
      }),
    }),
    controller.updateAdminUserStatus,
  );

  return router;
};

