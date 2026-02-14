import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { SystemController } from "@modules/system/presentation/system.controller";

export const createAdminSystemRouter = (): Router => {
  const router = Router();
  const controller = new SystemController();

  router.get("/dashboard", controller.getAdminDashboard);

  router.get("/system/flags", controller.listSystemFlags);
  router.put(
    "/system/flags/:flagKey",
    createAuditMiddleware({
      action: "admin.system.flags.update",
      entityType: "system_flags",
      resolveEntityId: (req) => req.params.flagKey,
    }),
    controller.updateSystemFlag,
  );

  router.get("/system/maintenance", controller.getMaintenanceStatus);
  router.put(
    "/system/maintenance",
    createAuditMiddleware({
      action: "admin.system.maintenance.update",
      entityType: "system_runtime_state",
      resolveEntityId: () => "global",
    }),
    controller.setMaintenanceStatus,
  );

  return router;
};

