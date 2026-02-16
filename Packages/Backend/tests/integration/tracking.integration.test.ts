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

describe.sequential("integration: rider tracking transitions", () => {
  let db: IsolatedTestDatabase;
  let app: Express;
  let riderToken: string;

  beforeAll(async () => {
    db = await createIsolatedTestDatabase();

    const [{ createApp }, { TokenService }] = await Promise.all([
      import("@src/app"),
      import("@modules/auth/infra/token.service"),
    ]);

    app = createApp();
    const tokenService = new TokenService() as TokenServiceType;
    riderToken = tokenService.issueAccessToken({
      id: seedIds.users.riderMaria,
      role: "rider",
    }).token;
  }, 180_000);

  afterAll(async () => {
    if (db) {
      await db.stop();
    }
  });

  it("rejects invalid transition and keeps event timeline consistent", async () => {
    const beforeCount = await db.prisma.order_events.count({
      where: {
        order_id: seedIds.orders.toCustomer,
      },
    });

    const response = await request(app)
      .post(`/v1/rider/orders/${seedIds.orders.toCustomer}/events`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        event_type: "waiting_order",
        occurred_at: "2026-02-16T12:01:00.000Z",
        note: "tentativa de transicao invalida",
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("TRANSITION_NOT_ALLOWED");

    const afterCount = await db.prisma.order_events.count({
      where: {
        order_id: seedIds.orders.toCustomer,
      },
    });

    const order = await db.prisma.orders.findUnique({
      where: {
        id: seedIds.orders.toCustomer,
      },
      select: {
        status: true,
      },
    });

    expect(afterCount).toBe(beforeCount);
    expect(order?.status).toBe("to_customer");
  });

  it("is idempotent for repeated same-step event", async () => {
    const first = await request(app)
      .post(`/v1/rider/orders/${seedIds.orders.toCustomer}/events`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        event_type: "rider_at_customer",
        occurred_at: "2026-02-16T12:05:00.000Z",
        note: "cheguei no cliente",
      });

    expect(first.status).toBe(200);
    expect(first.body.event_type).toBe("rider_at_customer");

    const afterFirstCount = await db.prisma.order_events.count({
      where: {
        order_id: seedIds.orders.toCustomer,
      },
    });

    const second = await request(app)
      .post(`/v1/rider/orders/${seedIds.orders.toCustomer}/events`)
      .set("authorization", `Bearer ${riderToken}`)
      .send({
        event_type: "rider_at_customer",
        occurred_at: "2026-02-16T12:06:00.000Z",
        note: "evento duplicado",
      });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("TRANSITION_NOT_ALLOWED");

    const afterSecondCount = await db.prisma.order_events.count({
      where: {
        order_id: seedIds.orders.toCustomer,
      },
    });

    const order = await db.prisma.orders.findUnique({
      where: {
        id: seedIds.orders.toCustomer,
      },
      select: {
        status: true,
      },
    });

    expect(afterSecondCount).toBe(afterFirstCount);
    expect(order?.status).toBe("at_customer");
  });
});
