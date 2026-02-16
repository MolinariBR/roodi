import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { ClientsController } from "@modules/clients/presentation/clients.controller";

export const createCommerceClientsRouter = (): Router => {
  const router = Router();
  const controller = new ClientsController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/clients", controller.listCommerceClients);
  router.post(
    "/clients",
    createAuditMiddleware({
      action: "commerce.client.create",
      entityType: "commerce_clients",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createCommerceClient,
  );
  router.patch(
    "/clients/:clientId",
    createAuditMiddleware({
      action: "commerce.client.update",
      entityType: "commerce_clients",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.updateCommerceClient,
  );

  return router;
};
