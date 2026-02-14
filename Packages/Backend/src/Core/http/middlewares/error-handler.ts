import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "@core/http/errors/app-error";
import { getRequestId } from "@core/http/middlewares/request-id";
import { logger } from "@core/observability/logger";

type ErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id: string;
  };
};

const sendErrorResponse = (
  res: Response,
  statusCode: number,
  payload: ErrorPayload,
): void => {
  res.status(statusCode).json(payload);
};

export const notFoundMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new AppError({
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
      statusCode: 404,
    }),
  );
};

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = getRequestId(res);

  if (error instanceof ZodError) {
    const payload: ErrorPayload = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: {
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
            message: issue.message,
          })),
        },
        request_id: requestId,
      },
    };

    logger.warn(
      {
        request_id: requestId,
        method: req.method,
        path: req.originalUrl,
        code: payload.error.code,
      },
      "request_validation_error",
    );

    sendErrorResponse(res, 422, payload);
    return;
  }

  if (error instanceof AppError) {
    const payload: ErrorPayload = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        request_id: requestId,
      },
    };

    logger.warn(
      {
        request_id: requestId,
        method: req.method,
        path: req.originalUrl,
        status_code: error.statusCode,
        code: error.code,
      },
      "request_handled_error",
    );

    sendErrorResponse(res, error.statusCode, payload);
    return;
  }

  const payload: ErrorPayload = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected internal server error.",
      request_id: requestId,
    },
  };

  logger.error(
    {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      error,
    },
    "request_unhandled_error",
  );

  sendErrorResponse(res, 500, payload);
};

