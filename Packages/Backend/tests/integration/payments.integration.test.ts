import { randomUUID } from "node:crypto";

import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../prisma/seeds/_shared/ids";
import {
  createIsolatedTestDatabase,
  type IsolatedTestDatabase,
} from "./_helpers/postgres-test-db";

type PaymentsServiceType = {
  consolidateOrderFinancials: (orderId: string) => Promise<void>;
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

  beforeAll(async () => {
    db = await createIsolatedTestDatabase();

    const [{ createApp }, { PaymentsService }] = await Promise.all([
      import("@src/app"),
      import("@modules/payments/application/payments.service"),
    ]);

    app = createApp();
    paymentsService = new PaymentsService() as PaymentsServiceType;
  }, 180_000);

  afterAll(async () => {
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
