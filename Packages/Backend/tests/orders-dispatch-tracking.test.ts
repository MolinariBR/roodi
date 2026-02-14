import request from "supertest";
import { describe, expect, it } from "vitest";

import { TokenService } from "@modules/auth/infra/token.service";
import { createApp } from "@src/app";

describe("orders, dispatch and tracking endpoints", () => {
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

  it("returns 401 on commerce orders list when authorization header is missing", async () => {
    const response = await request(app).get("/v1/commerce/orders");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 on rider offers current for commerce role", async () => {
    const response = await request(app)
      .get("/v1/rider/offers/current")
      .set("authorization", `Bearer ${commerceAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 422 on create commerce order with invalid payload", async () => {
    const response = await request(app)
      .post("/v1/commerce/orders")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({
        quote_id: "invalid-quote-id",
        urgency: "padrao",
        destination: {
          city: "Imperatriz",
        },
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on rider order event with invalid payload", async () => {
    const response = await request(app)
      .post("/v1/rider/orders/00000000-0000-0000-0000-000000000901/events")
      .set("authorization", `Bearer ${riderAccessToken}`)
      .send({
        note: "Missing event type and occurred_at",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on commerce tracking when order id is invalid", async () => {
    const response = await request(app)
      .get("/v1/commerce/orders/invalid-order-id/tracking")
      .set("authorization", `Bearer ${commerceAccessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
