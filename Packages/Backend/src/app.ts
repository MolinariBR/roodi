import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandlerMiddleware, notFoundMiddleware } from "@core/http/middlewares/error-handler";
import { requestIdMiddleware } from "@core/http/middlewares/request-id";
import { requestLoggerMiddleware } from "@core/http/middlewares/request-logger";
import { createApiRouter } from "@core/http/routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  app.use(createApiRouter());
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};
