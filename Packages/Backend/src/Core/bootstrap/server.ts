import type { Server } from "node:http";

import type { Express } from "express";

import { env } from "@core/config/env";
import { logger } from "@core/observability/logger";

export const startServer = (app: Express): Server => {
  return app.listen(env.port, () => {
    logger.info({ port: env.port }, "server_started");
  });
};
