import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@src/app";

describe("backend bootstrap routes", () => {
  const app = createApp();

  it("returns 200 on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.headers["x-request-id"]).toBeTypeOf("string");
  });

  it("returns 200 on /v1/system/status", async () => {
    const response = await request(app).get("/v1/system/status");

    expect([200, 503]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data).toHaveProperty("maintenance_mode");
      expect(response.body.data).toHaveProperty("app_version");
      expect(response.body.data).toHaveProperty("api_version");
      expect(response.body.data).toHaveProperty("timestamp");
      return;
    }

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(response.body.error.request_id).toBe(response.headers["x-request-id"]);
  });

  it("returns 401 on /v1/admin/system/maintenance without token", async () => {
    const response = await request(app).get("/v1/admin/system/maintenance");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.request_id).toBe(response.headers["x-request-id"]);
  });

  it("returns 404 with OpenAPI error payload on unknown route", async () => {
    const response = await request(app).get("/v1/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(response.body.error.request_id).toBe(response.headers["x-request-id"]);
  });
});
