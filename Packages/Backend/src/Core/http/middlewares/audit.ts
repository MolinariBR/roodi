import type { user_role } from "@prisma/client";
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { prisma } from "@core/database/prisma";
import { getRequestId } from "@core/http/middlewares/request-id";
import { logger } from "@core/observability/logger";

type AuditActorRole = user_role;

type AuditConfig = {
  action: string;
  entityType: string;
  resolveEntityId?: (req: Request, res: Response) => string | undefined;
  metadata?: (req: Request, res: Response) => Record<string, unknown>;
  onlyForMethods?: string[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isAuditActorRole = (value: string): value is AuditActorRole => {
  return value === "admin" || value === "commerce" || value === "rider";
};

const parseActorUserId = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return UUID_REGEX.test(value) ? value : undefined;
};

const parseActorRole = (value: string | undefined): AuditActorRole | undefined => {
  if (!value) {
    return undefined;
  }

  return isAuditActorRole(value) ? value : undefined;
};

const parseIpAddress = (ip: string | undefined): string | undefined => {
  if (!ip || ip.length === 0) {
    return undefined;
  }

  if (ip === "::1") {
    return "127.0.0.1";
  }

  return ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
};

export const createAuditMiddleware = (config: AuditConfig): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const methods = config.onlyForMethods ?? ["POST", "PUT", "PATCH", "DELETE"];
    const shouldAudit = methods.includes(req.method.toUpperCase());

    if (!shouldAudit) {
      next();
      return;
    }

    res.on("finish", () => {
      if (res.statusCode < 200 || res.statusCode >= 400) {
        return;
      }

      const requestId = getRequestId(res);
      const actorUserId =
        parseActorUserId(req.header("x-user-id")) ??
        parseActorUserId((res.locals.auth as { userId?: string } | undefined)?.userId);
      const actorRole =
        parseActorRole(req.header("x-user-role")) ??
        parseActorRole((res.locals.auth as { role?: string } | undefined)?.role);
      const entityId = config.resolveEntityId?.(req, res);
      const ipAddress = parseIpAddress(req.ip);
      const metadata = config.metadata?.(req, res) ?? {};

      void prisma.audit_logs
        .create({
          data: {
            request_id: requestId,
            actor_user_id: actorUserId,
            actor_role: actorRole,
            action: config.action,
            entity_type: config.entityType,
            entity_id: entityId,
            metadata: {
              method: req.method,
              path: req.originalUrl,
              status_code: res.statusCode,
              ...metadata,
            },
            ip_address: ipAddress,
            user_agent: req.header("user-agent"),
          },
        })
        .catch((error: unknown) => {
          logger.warn(
            {
              request_id: requestId,
              action: config.action,
              entity_type: config.entityType,
              error,
            },
            "audit_log_write_failed",
          );
        });
    });

    next();
  };
};
