import { execFileSync } from "node:child_process";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { GenericContainer, Wait } from "testcontainers";

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

  throw lastError ?? new Error("Falha inesperada ao executar comando Prisma.");
};

export type IsolatedTestDatabase = {
  databaseUrl: string;
  prisma: PrismaClient;
  stop: () => Promise<void>;
};

export const createIsolatedTestDatabase = async (): Promise<IsolatedTestDatabase> => {
  const container = await new GenericContainer("postgres:16-alpine")
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: "roodi_test",
      POSTGRES_USER: "postgres",
      POSTGRES_PASSWORD: "postgres",
    })
    .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const databaseUrl = withPublicSchema(
    `postgresql://postgres:postgres@${host}:${port}/roodi_test`,
  );
  const commandEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
  };

  await runPrismaCommandWithRetry(["migrate", "deploy"], commandEnv);
  await runPrismaCommandWithRetry(["db", "seed"], commandEnv);

  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = databaseUrl;
  process.env.INFINITEPAY_WEBHOOK_SECRET = "test-webhook-secret";
  process.env.INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE ?? "roodi-test-handle";

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  await prisma.$connect();

  return {
    databaseUrl,
    prisma,
    stop: async () => {
      await prisma.$disconnect();
      await container.stop();
    },
  };
};
