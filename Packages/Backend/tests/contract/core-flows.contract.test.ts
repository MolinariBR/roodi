import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../prisma/seeds/_shared/ids";
import {
  createContractRuntime,
  type ContractRuntime,
} from "./_helpers/contract-runtime";

describe.sequential("contract: critical backend flows with ephemeral infra", () => {
  let runtime: ContractRuntime;

  beforeAll(async () => {
    runtime = await createContractRuntime();
  }, 180_000);

  afterAll(async () => {
    if (runtime) {
      await runtime.stop();
    }
  });

  it("boots postgres+redis and exposes health contract", async () => {
    const redisPing = await runtime.redis.ping();
    expect(redisPing).toBe("PONG");

    const response = await request(runtime.app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(typeof response.body.data.timestamp).toBe("string");
  });

  it("keeps auth contract for register -> login -> refresh -> logout", async () => {
    const email = `contract.${Date.now()}@roodi.app`;
    const password = "Contract@123456";

    const registerResponse = await request(runtime.app).post("/v1/auth/register").send({
      name: "Contract Commerce",
      email,
      password,
      role: "commerce",
      phone_number: "+559999888877",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.user.email).toBe(email);
    expect(registerResponse.body.data.user.role).toBe("commerce");
    expect(typeof registerResponse.body.data.access_token).toBe("string");
    expect(typeof registerResponse.body.data.refresh_token).toBe("string");

    const loginResponse = await request(runtime.app).post("/v1/auth/login").send({
      email,
      password,
      role: "commerce",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(typeof loginResponse.body.data.access_token).toBe("string");
    expect(typeof loginResponse.body.data.refresh_token).toBe("string");

    const refreshToken = loginResponse.body.data.refresh_token as string;

    const refreshResponse = await request(runtime.app).post("/v1/auth/refresh").send({
      refresh_token: refreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.success).toBe(true);
    expect(typeof refreshResponse.body.data.access_token).toBe("string");

    const logoutResponse = await request(runtime.app).post("/v1/auth/logout").send({
      refresh_token: refreshToken,
    });

    expect(logoutResponse.status).toBe(204);

    const refreshAfterLogout = await request(runtime.app).post("/v1/auth/refresh").send({
      refresh_token: refreshToken,
    });

    expect(refreshAfterLogout.status).toBe(401);
    expect(refreshAfterLogout.body.success).toBe(false);
    expect(refreshAfterLogout.body.error.code).toBe("UNAUTHORIZED");
  });

  it("authenticates seeded users for admin, commerce and rider contexts", async () => {
    const credentials: ReadonlyArray<{
      email: string;
      password: string;
      role: "admin" | "commerce" | "rider";
    }> = [
      {
        email: "admin@roodi.app",
        password: "Admin@123456",
        role: "admin",
      },
      {
        email: "comercio.centro@roodi.app",
        password: "Commerce@123456",
        role: "commerce",
      },
      {
        email: "rider.maria@roodi.app",
        password: "Rider@123456",
        role: "rider",
      },
    ];

    for (const credential of credentials) {
      const response = await request(runtime.app).post("/v1/auth/login").send(credential);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credential.email);
      expect(response.body.data.user.role).toBe(credential.role);
      expect(typeof response.body.data.access_token).toBe("string");
      expect(typeof response.body.data.refresh_token).toBe("string");
    }
  });

  it("keeps quote contract and stores provider attempts", async () => {
    const commerceToken = runtime.issueAccessToken({
      id: seedIds.users.commerceCentro,
      role: "commerce",
    });

    const response = await request(runtime.app)
      .post("/v1/commerce/quotes")
      .set("authorization", `Bearer ${commerceToken}`)
      .send({
        origin_bairro: "Centro",
        destination_bairro: "Bacuri",
        urgency: "padrao",
        requested_at_iso: "2026-02-16T12:00:00.000Z",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      currency: "BRL",
      origin_bairro: "Centro",
      destination_bairro: "Bacuri",
    });
    expect(typeof response.body.data.quote_id).toBe("string");
    expect(typeof response.body.data.provider_trace.distance_time_provider).toBe("string");
    expect(typeof response.body.data.provider_trace.climate_provider).toBe("string");
    expect(typeof response.body.data.provider_trace.fallback_used).toBe("boolean");

    const attemptsCount = await runtime.prisma.quote_provider_attempts.count({
      where: {
        quote_id: response.body.data.quote_id as string,
      },
    });
    expect(attemptsCount).toBeGreaterThan(0);
  });

  it("executes delivery completion contract and persists financial consolidation", async () => {
    const commerceToken = runtime.issueAccessToken({
      id: seedIds.users.commerceFarmacia,
      role: "commerce",
    });
    const riderToken = runtime.issueAccessToken({
      id: seedIds.users.riderMaria,
      role: "rider",
    });
    const orderId = seedIds.orders.toCustomer;

    const confirmationCodeResponse = await request(runtime.app)
      .get(`/v1/commerce/orders/${orderId}/confirmation-code`)
      .set("authorization", `Bearer ${commerceToken}`);

    expect(confirmationCodeResponse.status).toBe(200);
    expect(confirmationCodeResponse.body.success).toBe(true);
    expect(typeof confirmationCodeResponse.body.data.code).toBe("string");
    expect((confirmationCodeResponse.body.data.code as string).length).toBe(4);

    const atCustomerResponse = await request(runtime.app)
      .post(`/v1/rider/orders/${orderId}/events`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        event_type: "rider_at_customer",
        occurred_at: "2026-02-16T12:20:00.000Z",
        note: "Chegada no cliente",
      });

    expect(atCustomerResponse.status).toBe(200);

    const finishingResponse = await request(runtime.app)
      .post(`/v1/rider/orders/${orderId}/events`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        event_type: "finishing_delivery",
        occurred_at: "2026-02-16T12:22:00.000Z",
        note: "Finalizando entrega",
      });

    expect(finishingResponse.status).toBe(200);

    const completeResponse = await request(runtime.app)
      .post(`/v1/rider/orders/${orderId}/complete`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        confirmation_code: confirmationCodeResponse.body.data.code,
      });

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe("completed");

    const financial = await runtime.prisma.order_financials.findUnique({
      where: {
        order_id: orderId,
      },
      select: {
        freight_platform_brl: true,
        rider_repass_brl: true,
        platform_commission_brl: true,
      },
    });

    expect(financial).not.toBeNull();

    const fp = Number(financial?.freight_platform_brl ?? 0);
    const re = Number(financial?.rider_repass_brl ?? 0);
    const cp = Number(financial?.platform_commission_brl ?? 0);

    expect(fp).toBeCloseTo(re + cp, 2);
  });
});
