import { randomUUID } from "node:crypto";

import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { seedIds } from "../../prisma/seeds/_shared/ids";
import {
  createIsolatedTestDatabase,
  type IsolatedTestDatabase,
} from "./_helpers/postgres-test-db";

type PaymentsServiceType = {
  consolidateOrderFinancials: (orderId: string) => Promise<void>;
};

type TokenServiceType = {
  issueAccessToken: (input: { id: string; role: "admin" | "commerce" | "rider" }) => {
    token: string;
  };
};

const approvedWebhookPayload = {
  invoice_slug: "inv-roodi-dev-0001",
  amount: 10000,
  paid_amount: 10000,
  installments: 1,
  capture_method: "pix" as const,
  transaction_nsu: "TXN-DEV-0001",
  order_nsu: "NSU-DEV-0001",
  receipt_url: "https://infinitepay.io/receipt/txn-dev-0001",
  items: [{ sku: "credit-purchase", quantity: 1 }],
};

describe.sequential("integration: payments, webhook idempotency and financial rules", () => {
  let db: IsolatedTestDatabase;
  let app: Express;
  let paymentsService: PaymentsServiceType;
  let tokenService: TokenServiceType;

  beforeAll(async () => {
    db = await createIsolatedTestDatabase();

    const [{ createApp }, { PaymentsService }, { TokenService }] = await Promise.all([
      import("@src/app"),
      import("@modules/payments/application/payments.service"),
      import("@modules/auth/infra/token.service"),
    ]);

    app = createApp();
    paymentsService = new PaymentsService() as PaymentsServiceType;
    tokenService = new TokenService() as TokenServiceType;
  }, 180_000);

  afterAll(async () => {
    vi.unstubAllGlobals();

    if (db) {
      await db.stop();
    }
  });

  it("rejects webhook with invalid secret and keeps wallet unchanged", async () => {
    const beforeWallet = await db.prisma.credits_wallets.findUniqueOrThrow({
      where: {
        commerce_user_id: seedIds.users.commerceCentro,
      },
      select: {
        balance_brl: true,
        reserved_brl: true,
      },
    });

    const response = await request(app)
      .post("/v1/payments/infinitepay/webhook")
      .set("x-webhook-secret", "wrong-secret")
      .send(approvedWebhookPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");

    const afterWallet = await db.prisma.credits_wallets.findUniqueOrThrow({
      where: {
        commerce_user_id: seedIds.users.commerceCentro,
      },
      select: {
        balance_brl: true,
        reserved_brl: true,
      },
    });

    expect(Number(afterWallet.balance_brl)).toBe(Number(beforeWallet.balance_brl));
    expect(Number(afterWallet.reserved_brl)).toBe(Number(beforeWallet.reserved_brl));
  });

  it("processes duplicate webhook once and keeps credits idempotent", async () => {
    const initialLedgerCount = await db.prisma.credits_ledger.count({
      where: {
        commerce_user_id: seedIds.users.commerceCentro,
        entry_type: "credit",
        reference_type: "payment_intent",
        reference_id: seedIds.finance.paymentIntentCentroCreditPurchase,
      },
    });

    const first = await request(app)
      .post("/v1/payments/infinitepay/webhook")
      .set("x-webhook-secret", "test-webhook-secret")
      .send(approvedWebhookPayload);

    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);
    expect(first.body.data.processed).toBe(true);
    expect(first.body.data.idempotent).toBe(false);

    const second = await request(app)
      .post("/v1/payments/infinitepay/webhook")
      .set("x-webhook-secret", "test-webhook-secret")
      .send(approvedWebhookPayload);

    expect(second.status).toBe(200);
    expect(second.body.success).toBe(true);
    expect(second.body.data.processed).toBe(true);
    expect(second.body.data.idempotent).toBe(true);

    const finalLedgerCount = await db.prisma.credits_ledger.count({
      where: {
        commerce_user_id: seedIds.users.commerceCentro,
        entry_type: "credit",
        reference_type: "payment_intent",
        reference_id: seedIds.finance.paymentIntentCentroCreditPurchase,
      },
    });

    expect(finalLedgerCount).toBe(initialLedgerCount);
  });

  it("creates order payment intent and marks order as paid after webhook", async () => {
    const now = new Date("2026-02-16T16:00:00.000Z");
    const orderId = randomUUID();
    const commerceToken = tokenService.issueAccessToken({
      id: seedIds.users.commerceCentro,
      role: "commerce",
    }).token;

    await db.prisma.orders.create({
      data: {
        id: orderId,
        order_code: `ORD-PAY-${Date.now()}`,
        commerce_user_id: seedIds.users.commerceCentro,
        status: "searching_rider",
        urgency: "padrao",
        total_brl: "12.90",
        payment_status: "pending",
        payment_required: true,
        confirmation_code_required: true,
        confirmation_code_status: "not_generated",
        created_at: now,
        updated_at: now,
      },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({
        checkout_url: "https://pay.infinitepay.io/checkout/order-123",
        slug: "order-payment-slug-123",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const createIntentResponse = await request(app)
      .post(`/v1/commerce/orders/${orderId}/payment-intent`)
      .set("authorization", `Bearer ${commerceToken}`)
      .send({
        customer: {
          name: "Cliente Teste",
          email: "cliente.teste@roodi.app",
        },
      });

    expect(createIntentResponse.status).toBe(201);
    expect(createIntentResponse.body.success).toBe(true);
    expect(createIntentResponse.body.data.order_id).toBe(orderId);
    expect(createIntentResponse.body.data.purpose).toBe("order_payment");
    expect(createIntentResponse.body.data.status).toBe("pending");
    expect(createIntentResponse.body.data.checkout_url).toBe(
      "https://pay.infinitepay.io/checkout/order-123",
    );

    const orderNsu = createIntentResponse.body.data.order_nsu as string;
    expect(typeof orderNsu).toBe("string");
    expect(orderNsu.startsWith("ORD-")).toBe(true);

    const statusBeforeWebhook = await request(app)
      .get(`/v1/commerce/orders/${orderId}/payment`)
      .set("authorization", `Bearer ${commerceToken}`);

    expect(statusBeforeWebhook.status).toBe(200);
    expect(statusBeforeWebhook.body.success).toBe(true);
    expect(statusBeforeWebhook.body.data.order_id).toBe(orderId);
    expect(statusBeforeWebhook.body.data.payment_status).toBe("pending");
    expect(statusBeforeWebhook.body.data.paid).toBe(false);

    const webhookResponse = await request(app)
      .post("/v1/payments/infinitepay/webhook")
      .set("x-webhook-secret", "test-webhook-secret")
      .send({
        ...approvedWebhookPayload,
        invoice_slug: `inv-order-${Date.now()}`,
        order_nsu: orderNsu,
        transaction_nsu: `TXN-ORDER-${Date.now()}`,
      });

    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body.success).toBe(true);
    expect(webhookResponse.body.data.idempotent).toBe(false);

    const orderAfterWebhook = await db.prisma.orders.findUniqueOrThrow({
      where: {
        id: orderId,
      },
      select: {
        payment_status: true,
        payment_confirmed_at: true,
      },
    });

    expect(orderAfterWebhook.payment_status).toBe("approved");
    expect(orderAfterWebhook.payment_confirmed_at).not.toBeNull();

    const paymentIntent = await db.prisma.payment_intents.findUniqueOrThrow({
      where: {
        order_nsu: orderNsu,
      },
      select: {
        id: true,
        purpose: true,
      },
    });

    const creditEntriesForIntent = await db.prisma.credits_ledger.count({
      where: {
        reference_type: "payment_intent",
        reference_id: paymentIntent.id,
      },
    });

    expect(paymentIntent.purpose).toBe("order_payment");
    expect(creditEntriesForIntent).toBe(0);

    const statusAfterWebhook = await request(app)
      .get(`/v1/commerce/orders/${orderId}/payment`)
      .set("authorization", `Bearer ${commerceToken}`);

    expect(statusAfterWebhook.status).toBe(200);
    expect(statusAfterWebhook.body.success).toBe(true);
    expect(statusAfterWebhook.body.data.payment_status).toBe("approved");
    expect(statusAfterWebhook.body.data.paid).toBe(true);
  });

  it("consolidates financials with FP = RE + CP and avoids duplicate debit", async () => {
    const orderId = randomUUID();
    const now = new Date("2026-02-16T15:00:00.000Z");

    await db.prisma.credits_wallets.update({
      where: {
        commerce_user_id: seedIds.users.commerceCentro,
      },
      data: {
        balance_brl: "180.00",
        reserved_brl: "20.00",
      },
    });

    await db.prisma.orders.create({
      data: {
        id: orderId,
        order_code: `ORD-FIN-${Date.now()}`,
        commerce_user_id: seedIds.users.commerceCentro,
        rider_user_id: seedIds.users.riderJoao,
        status: "completed",
        urgency: "padrao",
        total_brl: "15.99",
        confirmation_code_required: true,
        confirmation_code_status: "validated",
        completed_at: now,
        created_at: now,
        updated_at: now,
      },
    });

    await paymentsService.consolidateOrderFinancials(orderId);

    const financialRecord = await db.prisma.order_financials.findUniqueOrThrow({
      where: {
        order_id: orderId,
      },
      select: {
        freight_platform_brl: true,
        rider_repass_brl: true,
        platform_commission_brl: true,
      },
    });

    const fp = Number(financialRecord.freight_platform_brl);
    const re = Number(financialRecord.rider_repass_brl);
    const cp = Number(financialRecord.platform_commission_brl);

    expect(fp).toBeCloseTo(15.99, 2);
    expect(cp).toBeCloseTo(1, 2);
    expect(fp).toBeCloseTo(re + cp, 2);

    const debitCountAfterFirstRun = await db.prisma.credits_ledger.count({
      where: {
        order_id: orderId,
        entry_type: "debit",
      },
    });

    expect(debitCountAfterFirstRun).toBe(1);

    await paymentsService.consolidateOrderFinancials(orderId);

    const debitCountAfterSecondRun = await db.prisma.credits_ledger.count({
      where: {
        order_id: orderId,
        entry_type: "debit",
      },
    });

    expect(debitCountAfterSecondRun).toBe(1);
  });
});
