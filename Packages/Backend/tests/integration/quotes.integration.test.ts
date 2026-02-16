import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../prisma/seeds/_shared/ids";
import {
  createIsolatedTestDatabase,
  type IsolatedTestDatabase,
} from "./_helpers/postgres-test-db";

type TokenServiceType = {
  issueAccessToken: (user: {
    id: string;
    role: "admin" | "commerce" | "rider";
  }) => { token: string };
};

describe.sequential("integration: commerce quotes", () => {
  let db: IsolatedTestDatabase;
  let app: Express;
  let commerceToken: string;

  beforeAll(async () => {
    db = await createIsolatedTestDatabase();

    const [{ createApp }, { TokenService }] = await Promise.all([
      import("@src/app"),
      import("@modules/auth/infra/token.service"),
    ]);

    app = createApp();
    const tokenService = new TokenService() as TokenServiceType;

    commerceToken = tokenService.issueAccessToken({
      id: seedIds.users.commerceCentro,
      role: "commerce",
    }).token;
  }, 180_000);

  afterAll(async () => {
    if (db) {
      await db.stop();
    }
  });

  it("creates quote successfully and persists attempts", async () => {
    const response = await request(app)
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
    expect(response.body.data.quote_id).toEqual(expect.any(String));
    expect(response.body.data.price.total_brl).toBeGreaterThan(0);

    const persistedQuote = await db.prisma.quotes.findUnique({
      where: {
        id: response.body.data.quote_id,
      },
    });

    expect(persistedQuote).not.toBeNull();
    expect(persistedQuote?.success).toBe(true);
    expect(Number(persistedQuote?.total_brl ?? 0)).toBeGreaterThan(0);

    const attemptsCount = await db.prisma.quote_provider_attempts.count({
      where: {
        quote_id: response.body.data.quote_id,
      },
    });

    expect(attemptsCount).toBeGreaterThan(0);
  });

  it("returns DISTANCE_TIME_UNAVAILABLE and persists failure quote", async () => {
    const response = await request(app)
      .post("/v1/commerce/quotes")
      .set("authorization", `Bearer ${commerceToken}`)
      .send({
        origin_bairro: "Centro",
        destination_bairro: "Centro",
        urgency: "padrao",
        requested_at_iso: "2026-02-16T12:00:00.000Z",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("DISTANCE_TIME_UNAVAILABLE");
    expect(response.body.error.details.quote_id).toEqual(expect.any(String));

    const failedQuote = await db.prisma.quotes.findUnique({
      where: {
        id: response.body.error.details.quote_id as string,
      },
    });

    expect(failedQuote).not.toBeNull();
    expect(failedQuote?.success).toBe(false);
    expect(failedQuote?.error_code).toBe("DISTANCE_TIME_UNAVAILABLE");
  });

  it("returns OUT_OF_COVERAGE for unknown bairros", async () => {
    const response = await request(app)
      .post("/v1/commerce/quotes")
      .set("authorization", `Bearer ${commerceToken}`)
      .send({
        origin_bairro: "Bairro Inexistente X",
        destination_bairro: "Bacuri",
        urgency: "padrao",
        requested_at_iso: "2026-02-16T12:00:00.000Z",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("OUT_OF_COVERAGE");
  });
});
