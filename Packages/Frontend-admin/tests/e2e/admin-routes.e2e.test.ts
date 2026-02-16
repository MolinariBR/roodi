import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const FRONTEND_ADMIN_ROOT = path.resolve(currentDir, "..", "..");
const BASE_URL = "http://127.0.0.1:3011";

const waitForServer = async (
  getLogs: () => string,
  timeoutMs = 60_000,
): Promise<void> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/admin/login`, { redirect: "manual" });
      if (response.status === 200 || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {
      // keep polling until timeout
    }

    await delay(500);
  }

  throw new Error(
    `Next server did not start in time for e2e route tests.\n\nStartup logs:\n${getLogs()}`,
  );
};

describe.sequential("e2e: admin routes and auth guards", () => {
  let serverProcess: ChildProcessWithoutNullStreams | null = null;
  let startupLogs = "";

  beforeAll(async () => {
    serverProcess = spawn("npx", ["next", "dev", "-p", "3011"], {
      cwd: FRONTEND_ADMIN_ROOT,
      env: {
        ...process.env,
        NODE_ENV: "development",
      },
      stdio: "pipe",
    });

    serverProcess.stdout.on("data", (chunk) => {
      startupLogs += chunk.toString();
    });
    serverProcess.stderr.on("data", (chunk) => {
      startupLogs += chunk.toString();
    });

    await waitForServer(() => startupLogs);
  }, 120_000);

  afterAll(async () => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill("SIGTERM");
    }
  });

  it(
    "redirects root route to /admin/login",
    async () => {
      const response = await fetch(`${BASE_URL}/`, { redirect: "manual" });

      expect([307, 308]).toContain(response.status);
      expect(response.headers.get("location")).toBe("/admin/login");
    },
    20_000,
  );

  it(
    "blocks /admin/dashboard without admin session and redirects to login",
    async () => {
      const response = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: "manual" });

      expect([307, 308]).toContain(response.status);
      expect(response.headers.get("location")).toBe("/admin/login?error=unauthorized");
    },
    20_000,
  );

  it("renders login route", async () => {
    const response = await fetch(`${BASE_URL}/admin/login`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Acesso ao painel");
  });

  it("does not crash while serving guarded routes", async () => {
    expect(startupLogs).not.toContain("Error:");
  });
});
