import pino from "pino";

import { env } from "@core/config/env";

export const logger = pino({
  level: env.logLevel,
  base: {
    service: "roodi-backend",
    environment: env.nodeEnv,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

