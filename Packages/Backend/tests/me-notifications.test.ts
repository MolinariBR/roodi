import request from "supertest";
import { describe, expect, it } from "vitest";

import { TokenService } from "@modules/auth/infra/token.service";
import { createApp } from "@src/app";

describe("me and notifications endpoints", () => {
  const app = createApp();
  const tokenService = new TokenService();
  const accessToken = tokenService.issueAccessToken({
    id: "11111111-1111-4111-8111-111111111111",
    role: "rider",
  }).token;

  it("returns 401 on /v1/me without token", async () => {
    const response = await request(app).get("/v1/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 on /v1/me/settings/notifications without token", async () => {
    const response = await request(app).get("/v1/me/settings/notifications");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 on /v1/notifications without token", async () => {
    const response = await request(app).get("/v1/notifications");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 422 on /v1/me with invalid payload", async () => {
    const response = await request(app)
      .patch("/v1/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "a" });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on /v1/notifications/:notificationId/read with invalid id", async () => {
    const response = await request(app)
      .patch("/v1/notifications/not-a-uuid/read")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 on /v1/notifications/mark-all-read without token", async () => {
    const response = await request(app).post("/v1/notifications/mark-all-read");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
