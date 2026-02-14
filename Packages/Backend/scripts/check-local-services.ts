import net from "node:net";
import process from "node:process";
import { createClient } from "redis";

import { env } from "../src/Core/config/env";

type CheckResult = {
  service: string;
  ok: boolean;
  message: string;
};

const checkTcpConnection = async (service: string, urlString: string, defaultPort: number): Promise<CheckResult> => {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname;
    const port = Number(parsed.port || defaultPort);

    await new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      const timeoutMs = 4000;

      socket.setTimeout(timeoutMs);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("timeout", () => {
        socket.destroy();
        reject(new Error(`timeout after ${timeoutMs}ms`));
      });
      socket.once("error", (error) => {
        socket.destroy();
        reject(error);
      });

      socket.connect(port, host);
    });

    return {
      service,
      ok: true,
      message: `${service} reachable on ${host}:${port}`,
    };
  } catch (error) {
    return {
      service,
      ok: false,
      message: `${service} unavailable: ${(error as Error).message}`,
    };
  }
};

const checkRedisPing = async (): Promise<CheckResult> => {
  const client = createClient({ url: env.redisUrl });

  try {
    await client.connect();
    const pong = await client.ping();

    return {
      service: "Redis",
      ok: pong === "PONG",
      message: pong === "PONG" ? "Redis ping successful (PONG)" : `Unexpected Redis ping response: ${pong}`,
    };
  } catch (error) {
    return {
      service: "Redis",
      ok: false,
      message: `Redis unavailable: ${(error as Error).message}`,
    };
  } finally {
    if (client.isOpen) {
      await client.disconnect();
    }
  }
};

const main = async (): Promise<void> => {
  const checks: CheckResult[] = [];

  checks.push(await checkTcpConnection("PostgreSQL", env.databaseUrl, 5432));
  checks.push(await checkRedisPing());

  for (const check of checks) {
    const status = check.ok ? "OK" : "FAIL";
    console.log(`[${status}] ${check.service}: ${check.message}`);
  }

  const hasFailure = checks.some((check) => !check.ok);

  if (hasFailure) {
    process.exitCode = 1;
  }
};

void main();
