import { Router } from "express";

import { requireAdminMiddleware } from "@core/http/middlewares/authorize";
import { authenticateAccessTokenMiddleware } from "@core/http/middlewares/authenticate";
import { createAuthRouter } from "@modules/auth/presentation/auth.routes";
import { createCommerceCreditsRouter } from "@modules/credits/presentation/credits.routes";
import { createRiderDispatchRouter } from "@modules/dispatch/presentation/dispatch.routes";
import { createNotificationsRouter } from "@modules/notifications/presentation/notifications.routes";
import {
  createCommerceOrdersRouter,
  createRiderOrdersRouter,
} from "@modules/orders/presentation/orders.routes";
import {
  createCommercePaymentsRouter,
  createPaymentsWebhookRouter,
} from "@modules/payments/presentation/payments.routes";
import { createCommerceQuotesRouter } from "@modules/pricing/presentation/quotes.routes";
import { createPublicRouter } from "@modules/public/presentation/public.routes";
import { createSupportRouter } from "@modules/support/presentation/support.routes";
import { createSystemRouter } from "@modules/system/presentation/system.routes";
import {
  createCommerceTrackingRouter,
  createRiderTrackingRouter,
} from "@modules/tracking/presentation/tracking.routes";
import { createUsersRouter } from "@modules/users/presentation/users.routes";
import { createAdminCreditsRouter } from "@modules/credits/presentation/admin.credits.routes";
import { createAdminOrdersRouter } from "@modules/orders/presentation/admin.orders.routes";
import { createAdminPaymentsRouter } from "@modules/payments/presentation/admin.payments.routes";
import { createAdminPricingRouter } from "@modules/pricing/presentation/admin.pricing.routes";
import { createAdminSupportRouter } from "@modules/support/presentation/admin.support.routes";
import { createAdminSystemRouter } from "@modules/system/presentation/admin.system.routes";
import { createAdminTrackingRouter } from "@modules/tracking/presentation/admin.tracking.routes";
import { createAdminUsersRouter } from "@modules/users/presentation/admin.users.routes";
import { createAdminNotificationsRouter } from "@modules/notifications/presentation/admin.notifications.routes";

export const createApiRouter = (): Router => {
  const router = Router();

  const adminRouter = Router();
  adminRouter.use(authenticateAccessTokenMiddleware, requireAdminMiddleware);
  adminRouter.use(createAdminSystemRouter());
  adminRouter.use(createAdminUsersRouter());
  adminRouter.use(createAdminOrdersRouter());
  adminRouter.use(createAdminTrackingRouter());
  adminRouter.use(createAdminPricingRouter());
  adminRouter.use(createAdminCreditsRouter());
  adminRouter.use(createAdminPaymentsRouter());
  adminRouter.use(createAdminSupportRouter());
  adminRouter.use(createAdminNotificationsRouter());

  router.use("/v1/auth", createAuthRouter());
  router.use("/v1/me", createUsersRouter());
  router.use("/v1/notifications", createNotificationsRouter());
  router.use("/v1/admin", adminRouter);
  router.use("/v1/commerce", createCommerceCreditsRouter());
  router.use("/v1/commerce", createCommerceQuotesRouter());
  router.use("/v1/commerce", createCommerceOrdersRouter());
  router.use("/v1/commerce", createCommercePaymentsRouter());
  router.use("/v1/commerce", createCommerceTrackingRouter());
  router.use("/v1/public", createPublicRouter());
  router.use("/v1/payments", createPaymentsWebhookRouter());
  router.use("/v1/rider", createRiderDispatchRouter());
  router.use("/v1/rider", createRiderOrdersRouter());
  router.use("/v1/rider", createRiderTrackingRouter());
  router.use("/v1/support", createSupportRouter());
  router.use("/v1/system", createSystemRouter());

  router.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
};
