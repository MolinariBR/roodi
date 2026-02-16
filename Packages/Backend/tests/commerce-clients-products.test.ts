import request from "supertest";
import { describe, expect, it } from "vitest";

import { TokenService } from "@modules/auth/infra/token.service";
import { createApp } from "@src/app";

describe("commerce clients and products endpoints", () => {
  const app = createApp();
  const tokenService = new TokenService();

  const commerceAccessToken = tokenService.issueAccessToken({
    id: "00000000-0000-0000-0000-000000000201",
    role: "commerce",
  }).token;

  const riderAccessToken = tokenService.issueAccessToken({
    id: "00000000-0000-0000-0000-000000000301",
    role: "rider",
  }).token;

  it("returns 401 on clients list without token", async () => {
    const response = await request(app).get("/v1/commerce/clients");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 on clients list for rider role", async () => {
    const response = await request(app)
      .get("/v1/commerce/clients")
      .set("authorization", `Bearer ${riderAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 422 on clients list with invalid page", async () => {
    const response = await request(app)
      .get("/v1/commerce/clients?page=0")
      .set("authorization", `Bearer ${commerceAccessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on clients update with invalid client id", async () => {
    const response = await request(app)
      .patch("/v1/commerce/clients/not-a-uuid")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({
        name: "Cliente Teste",
        phone_number: "+55999999999",
        address: {},
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on products list with invalid status", async () => {
    const response = await request(app)
      .get("/v1/commerce/products?status=invalid-status")
      .set("authorization", `Bearer ${commerceAccessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on products status update with invalid product id", async () => {
    const response = await request(app)
      .post("/v1/commerce/products/not-a-uuid/status")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({
        status: "paused",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
