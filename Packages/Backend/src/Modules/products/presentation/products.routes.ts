import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { ProductsController } from "@modules/products/presentation/products.controller";

export const createCommerceProductsRouter = (): Router => {
  const router = Router();
  const controller = new ProductsController();

  router.use(authenticateAccessTokenMiddleware);

  router.get("/products", controller.listCommerceProducts);
  router.post(
    "/products",
    createAuditMiddleware({
      action: "commerce.product.create",
      entityType: "commerce_products",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.createCommerceProduct,
  );
  router.patch(
    "/products/:productId",
    createAuditMiddleware({
      action: "commerce.product.update",
      entityType: "commerce_products",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.updateCommerceProduct,
  );
  router.post(
    "/products/:productId/status",
    createAuditMiddleware({
      action: "commerce.product.status.update",
      entityType: "commerce_products",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.updateCommerceProductStatus,
  );

  return router;
};
