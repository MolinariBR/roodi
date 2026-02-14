import { randomUUID } from "node:crypto";

import type { NextFunction, Request, RequestHandler, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const incomingRequestId = req.header(REQUEST_ID_HEADER);
  const requestId =
    typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : randomUUID();

  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};

export const getRequestId = (res: Response): string => {
  if (typeof res.locals.requestId === "string" && res.locals.requestId.trim().length > 0) {
    return res.locals.requestId;
  }

  return "unknown-request-id";
};

