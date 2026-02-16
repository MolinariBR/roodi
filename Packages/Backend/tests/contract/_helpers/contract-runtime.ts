import { execFileSync } from "node:child_process";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { GenericContainer, Wait } from "testcontainers";

type UserRole = "admin" | "commerce" | "rider";

type TokenServiceType = {
  issueAccessToken: (user: { id: string; role: UserRole }) => { token: string };
};
type ContractRedisClient = ReturnType<typeof createClient>;

const BACKEND_ROOT = path.resolve(__dirname, "..", "..", "..");

const withPublicSchema = (databaseUrl: string): string => {
  if (databaseUrl.includes("schema=")) {
    return databaseUrl;
  }

  return databaseUrl.includes("?")
    ? `${databaseUrl}&schema=public`
    : `${databaseUrl}?schema=public`;
};

const runPrismaCommand = (args: string[], env: NodeJS.ProcessEnv): void => {
  const command = ["prisma", ...args].join(" ");

  try {
    execFileSync("npx", ["prisma", ...args], {
      cwd: BACKEND_ROOT,
      env,
      stdio: "pipe",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Falha ao executar: npx ${command} | ${error.message}`);
    }

    throw new Error(`Falha ao executar: npx ${command}`);
  }
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const runPrismaCommandWithRetry = async (
  args: string[],
  env: NodeJS.ProcessEnv,
  maxAttempts = 5,
): Promise<void> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      runPrismaCommand(args, env);
      return;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts) {
        throw lastError;
      }

      await delay(1000 * attempt);
    }
  }

  throw lastError ?? new Error("Falha ao executar comando Prisma.");
};

export type ContractRuntime = {
  app: import("express").Express;
  prisma: PrismaClient;
  redis: ContractRedisClient;
  issueAccessToken: (user: { id: string; role: UserRole }) => string;
  stop: () => Promise<void>;
};

export const createContractRuntime = async (): Promise<ContractRuntime> => {
  const postgresContainer = await new GenericContainer("postgres:16-alpine")
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: "roodi_contract",
      POSTGRES_USER: "postgres",
      POSTGRES_PASSWORD: "postgres",
    })
    .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
    .start();

  const redisContainer = await new GenericContainer("redis:7-alpine")
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
    .start();

  const databaseUrl = withPublicSchema(
    `postgresql://postgres:postgres@${postgresContainer.getHost()}:${postgresContainer.getMappedPort(5432)}/roodi_contract`,
  );
  const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;

  const commandEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
  };

  await runPrismaCommandWithRetry(["migrate", "deploy"], commandEnv);
  await runPrismaCommandWithRetry(["db", "seed"], commandEnv);

  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = databaseUrl;
  process.env.REDIS_URL = redisUrl;
  process.env.INFINITEPAY_WEBHOOK_SECRET = "test-webhook-secret";
  process.env.INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE ?? "roodi-test-handle";

  const [{ createApp }, { TokenService }] = await Promise.all([
    import("@src/app"),
    import("@modules/auth/infra/token.service"),
  ]);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  const redis = createClient({
    url: redisUrl,
  });

  await prisma.$connect();
  await redis.connect();

  const tokenService = new TokenService() as TokenServiceType;
  const app = createApp();

  return {
    app,
    prisma,
    redis,
    issueAccessToken: (user) => tokenService.issueAccessToken(user).token,
    stop: async () => {
      await redis.quit().catch(() => undefined);
      await prisma.$disconnect();
      await postgresContainer.stop();
      await redisContainer.stop();
    },
  };
};
