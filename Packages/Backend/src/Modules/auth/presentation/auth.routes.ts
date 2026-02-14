import { Router } from "express";

import { createAuditMiddleware } from "@core/http/middlewares/audit";
import { AuthController } from "@modules/auth/presentation/auth.controller";

export const createAuthRouter = (): Router => {
  const router = Router();
  const controller = new AuthController();

  router.post(
    "/register",
    createAuditMiddleware({
      action: "auth.register",
      entityType: "users",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.register,
  );
  router.post("/login", controller.login);
  router.post("/refresh", controller.refresh);
  router.post(
    "/logout",
    createAuditMiddleware({
      action: "auth.logout",
      entityType: "auth_refresh_tokens",
    }),
    controller.logout,
  );
  router.post(
    "/password/forgot",
    createAuditMiddleware({
      action: "auth.password.forgot",
      entityType: "auth_otp_challenges",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.forgotPassword,
  );
  router.post(
    "/password/otp/verify",
    createAuditMiddleware({
      action: "auth.password.verify_otp",
      entityType: "auth_otp_challenges",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.verifyOtp,
  );
  router.post(
    "/password/reset",
    createAuditMiddleware({
      action: "auth.password.reset",
      entityType: "users",
      resolveEntityId: (_req, res) => {
        return typeof res.locals.auditEntityId === "string" ? res.locals.auditEntityId : undefined;
      },
    }),
    controller.resetPassword,
  );

  return router;
};
