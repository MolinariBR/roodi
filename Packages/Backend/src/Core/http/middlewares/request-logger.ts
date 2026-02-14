import type { NextFunction, Request, RequestHandler, Response } from "express";

import { getRequestId } from "@core/http/middlewares/request-id";
import { logger } from "@core/observability/logger";

const getDurationInMs = (startedAt: bigint): number => {
  const diff = process.hrtime.bigint() - startedAt;
  return Number(diff) / 1_000_000;
};

export const requestLoggerMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startedAt = process.hrtime.bigint();
  const requestId = getRequestId(res);

  logger.info(
    {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
    },
    "request_started",
  );

  res.on("finish", () => {
    logger.info(
      {
        request_id: requestId,
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: Number(getDurationInMs(startedAt).toFixed(2)),
      },
      "request_finished",
    );
  });

  next();
};

