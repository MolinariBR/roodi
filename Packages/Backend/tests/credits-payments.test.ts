import request from "supertest";
import { describe, expect, it } from "vitest";

import { TokenService } from "@modules/auth/infra/token.service";
import { createApp } from "@src/app";

describe("credits and payments endpoints", () => {
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

  it("returns 401 on credits balance without token", async () => {
    const response = await request(app).get("/v1/commerce/credits/balance");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 on credits balance for rider role", async () => {
    const response = await request(app)
      .get("/v1/commerce/credits/balance")
      .set("authorization", `Bearer ${riderAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 422 on credits ledger with invalid page", async () => {
    const response = await request(app)
      .get("/v1/commerce/credits/ledger?page=0")
      .set("authorization", `Bearer ${commerceAccessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on purchase intent with invalid amount", async () => {
    const response = await request(app)
      .post("/v1/commerce/credits/purchase-intents")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({
        amount_brl: 0,
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on payment check with invalid payment id", async () => {
    const response = await request(app)
      .post("/v1/commerce/payments/not-a-uuid/check")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({
        handle: "my-handle",
        order_nsu: "order-nsu",
        transaction_nsu: "tx-nsu",
        slug: "invoice-slug",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on order payment intent with invalid order id", async () => {
    const response = await request(app)
      .post("/v1/commerce/orders/not-a-uuid/payment-intent")
      .set("authorization", `Bearer ${commerceAccessToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 403 on order payment status for rider role", async () => {
    const response = await request(app)
      .get("/v1/commerce/orders/00000000-0000-0000-0000-000000000901/payment")
      .set("authorization", `Bearer ${riderAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 422 on webhook with invalid payload", async () => {
    const response = await request(app).post("/v1/payments/infinitepay/webhook").send({
      invoice_slug: "inv-1",
      amount: 1000,
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
