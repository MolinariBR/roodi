import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import type { Prisma } from "@prisma/client";

const CENTER_CREDIT_PURCHASE = {
  orderNsu: "NSU-DEV-0001",
  transactionNsu: "TXN-DEV-0001",
  invoiceSlug: "inv-roodi-dev-0001",
  amountBrl: "100.00",
  amountCents: 10000,
  checkoutUrl: "https://checkout.infinitepay.io/dev/nsu-dev-0001",
  receiptUrl: "https://infinitepay.io/receipt/txn-dev-0001",
  approvedAt: new Date("2026-02-13T18:40:00.000Z"),
  webhookReceivedAt: new Date("2026-02-13T18:40:15.000Z"),
  webhookProcessedAt: new Date("2026-02-13T18:40:16.000Z"),
};

const FARMACIA_CREDIT_PURCHASE_FAILED = {
  orderNsu: "NSU-DEV-0002",
  transactionNsu: "TXN-DEV-0002",
  invoiceSlug: "inv-roodi-dev-0002",
  amountBrl: "60.00",
  amountCents: 6000,
  checkoutUrl: "https://checkout.infinitepay.io/dev/nsu-dev-0002",
  webhookReceivedAt: new Date("2026-02-13T20:10:05.000Z"),
  webhookProcessedAt: new Date("2026-02-13T20:10:06.000Z"),
};

const CENTER_CREDIT_PURCHASE_CANCELED = {
  orderNsu: "NSU-DEV-0003",
  transactionNsu: "TXN-DEV-0003",
  invoiceSlug: "inv-roodi-dev-0003",
  amountBrl: "45.00",
  amountCents: 4500,
  checkoutUrl: "https://checkout.infinitepay.io/dev/nsu-dev-0003",
  webhookReceivedAt: new Date("2026-02-13T21:15:00.000Z"),
  webhookProcessedAt: new Date("2026-02-13T21:15:01.000Z"),
};

const ORDER_FINANCIALS_COMPLETED = {
  freightPlatformBrl: "13.00",
  riderRepassBrl: "12.00",
  platformCommissionBrl: "1.00",
  chargedAt: new Date("2026-02-13T19:43:00.000Z"),
};

function buildWebhookPayload(): Prisma.InputJsonValue {
  return {
    provider: "infinitepay",
    event: "payment.approved",
    order_nsu: CENTER_CREDIT_PURCHASE.orderNsu,
    transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
    invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
    amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
    status: "approved",
    paid_at: CENTER_CREDIT_PURCHASE.approvedAt.toISOString(),
  };
}

function buildFailedWebhookPayload(): Prisma.InputJsonValue {
  return {
    provider: "infinitepay",
    event: "payment.failed",
    order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu,
    transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
    invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
    amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
    status: "failed",
    reason: "gateway_declined",
  };
}

function buildCanceledWebhookPayload(): Prisma.InputJsonValue {
  return {
    provider: "infinitepay",
    event: "payment.canceled",
    order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu,
    transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
    invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
    amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
    status: "canceled",
    reason: "user_aborted_checkout",
  };
}

export async function seedFinance({ prisma }: SeedContext): Promise<void> {
  const completedOrder = await prisma.orders.findUnique({
    where: { order_code: "ORD-DEV-0003" },
    select: { id: true, commerce_user_id: true, total_brl: true },
  });

  if (!completedOrder) {
    throw new Error("Pedido ORD-DEV-0003 nao encontrado para seed financeiro.");
  }

  await prisma.credits_wallets.upsert({
    where: { commerce_user_id: seedIds.users.commerceCentro },
    update: {
      balance_brl: "387.00",
      reserved_brl: "0.00",
    },
    create: {
      commerce_user_id: seedIds.users.commerceCentro,
      balance_brl: "387.00",
      reserved_brl: "0.00",
    },
  });

  await prisma.credits_wallets.upsert({
    where: { commerce_user_id: seedIds.users.commerceFarmacia },
    update: {
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
    create: {
      commerce_user_id: seedIds.users.commerceFarmacia,
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
  });

  await prisma.payment_intents.upsert({
    where: { order_nsu: CENTER_CREDIT_PURCHASE.orderNsu },
    update: {
      commerce_user_id: seedIds.users.commerceCentro,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "approved",
      amount_brl: CENTER_CREDIT_PURCHASE.amountBrl,
      amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      provider_handle: `ip-checkout-${CENTER_CREDIT_PURCHASE.orderNsu.toLowerCase()}`,
      checkout_url: CENTER_CREDIT_PURCHASE.checkoutUrl,
      redirect_url: CENTER_CREDIT_PURCHASE.checkoutUrl,
      webhook_url:
        "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "approved",
        invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
        transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      },
      expires_at: null,
    },
    create: {
      id: seedIds.finance.paymentIntentCentroCreditPurchase,
      commerce_user_id: seedIds.users.commerceCentro,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "approved",
      amount_brl: CENTER_CREDIT_PURCHASE.amountBrl,
      amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      provider_handle: `ip-checkout-${CENTER_CREDIT_PURCHASE.orderNsu.toLowerCase()}`,
      order_nsu: CENTER_CREDIT_PURCHASE.orderNsu,
      checkout_url: CENTER_CREDIT_PURCHASE.checkoutUrl,
      redirect_url: CENTER_CREDIT_PURCHASE.checkoutUrl,
      webhook_url:
        "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "approved",
        invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
        transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      },
      expires_at: null,
    },
  });

  const paymentIntent = await prisma.payment_intents.findUniqueOrThrow({
    where: { order_nsu: CENTER_CREDIT_PURCHASE.orderNsu },
    select: { id: true },
  });

  await prisma.payment_transactions.upsert({
    where: { id: seedIds.finance.paymentTransactionCentroApproved },
    update: {
      payment_intent_id: paymentIntent.id,
      provider: "infinitepay",
      status: "approved",
      invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      capture_method: "pix",
      amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      paid_amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      installments: 1,
      receipt_url: CENTER_CREDIT_PURCHASE.receiptUrl,
      provider_payload: {
        gateway: "infinitepay",
        status: "approved",
      },
      approved_at: CENTER_CREDIT_PURCHASE.approvedAt,
    },
    create: {
      id: seedIds.finance.paymentTransactionCentroApproved,
      payment_intent_id: paymentIntent.id,
      provider: "infinitepay",
      status: "approved",
      invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      capture_method: "pix",
      amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      paid_amount_cents: CENTER_CREDIT_PURCHASE.amountCents,
      installments: 1,
      receipt_url: CENTER_CREDIT_PURCHASE.receiptUrl,
      provider_payload: {
        gateway: "infinitepay",
        status: "approved",
      },
      approved_at: CENTER_CREDIT_PURCHASE.approvedAt,
    },
  });

  await prisma.payment_webhook_events.upsert({
    where: {
      idempotency_key: seedIds.finance.webhookIdempotencyCentroApproved,
    },
    update: {
      provider: "infinitepay",
      event_key: "payment.approved",
      invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      order_nsu: CENTER_CREDIT_PURCHASE.orderNsu,
      payload: buildWebhookPayload(),
      processing_status: "processed",
      error_message: null,
      received_at: CENTER_CREDIT_PURCHASE.webhookReceivedAt,
      processed_at: CENTER_CREDIT_PURCHASE.webhookProcessedAt,
    },
    create: {
      provider: "infinitepay",
      event_key: "payment.approved",
      invoice_slug: CENTER_CREDIT_PURCHASE.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE.transactionNsu,
      order_nsu: CENTER_CREDIT_PURCHASE.orderNsu,
      idempotency_key: seedIds.finance.webhookIdempotencyCentroApproved,
      payload: buildWebhookPayload(),
      processing_status: "processed",
      error_message: null,
      received_at: CENTER_CREDIT_PURCHASE.webhookReceivedAt,
      processed_at: CENTER_CREDIT_PURCHASE.webhookProcessedAt,
    },
  });

  await prisma.credits_ledger.upsert({
    where: { id: seedIds.finance.creditsLedgerCentroCredit },
    update: {
      commerce_user_id: seedIds.users.commerceCentro,
      order_id: null,
      entry_type: "credit",
      amount_brl: CENTER_CREDIT_PURCHASE.amountBrl,
      balance_after_brl: "400.00",
      reference_type: "payment_intent",
      reference_id: paymentIntent.id,
      reason: "Compra de creditos aprovada via InfinitePay.",
      created_by_user_id: seedIds.users.admin,
      created_at: CENTER_CREDIT_PURCHASE.approvedAt,
    },
    create: {
      id: seedIds.finance.creditsLedgerCentroCredit,
      commerce_user_id: seedIds.users.commerceCentro,
      order_id: null,
      entry_type: "credit",
      amount_brl: CENTER_CREDIT_PURCHASE.amountBrl,
      balance_after_brl: "400.00",
      reference_type: "payment_intent",
      reference_id: paymentIntent.id,
      reason: "Compra de creditos aprovada via InfinitePay.",
      created_by_user_id: seedIds.users.admin,
      created_at: CENTER_CREDIT_PURCHASE.approvedAt,
    },
  });

  await prisma.credits_ledger.upsert({
    where: { id: seedIds.finance.creditsLedgerCentroOrderDebit },
    update: {
      commerce_user_id: seedIds.users.commerceCentro,
      order_id: completedOrder.id,
      entry_type: "debit",
      amount_brl: "-13.00",
      balance_after_brl: "387.00",
      reference_type: "order",
      reference_id: completedOrder.id,
      reason: "Debito de frete da entrega concluida ORD-DEV-0003.",
      created_by_user_id: seedIds.users.admin,
      created_at: ORDER_FINANCIALS_COMPLETED.chargedAt,
    },
    create: {
      id: seedIds.finance.creditsLedgerCentroOrderDebit,
      commerce_user_id: seedIds.users.commerceCentro,
      order_id: completedOrder.id,
      entry_type: "debit",
      amount_brl: "-13.00",
      balance_after_brl: "387.00",
      reference_type: "order",
      reference_id: completedOrder.id,
      reason: "Debito de frete da entrega concluida ORD-DEV-0003.",
      created_by_user_id: seedIds.users.admin,
      created_at: ORDER_FINANCIALS_COMPLETED.chargedAt,
    },
  });

  await prisma.order_financials.upsert({
    where: { order_id: completedOrder.id },
    update: {
      freight_platform_brl: ORDER_FINANCIALS_COMPLETED.freightPlatformBrl,
      rider_repass_brl: ORDER_FINANCIALS_COMPLETED.riderRepassBrl,
      platform_commission_brl:
        ORDER_FINANCIALS_COMPLETED.platformCommissionBrl,
      charged_at: ORDER_FINANCIALS_COMPLETED.chargedAt,
      repass_status: "pending",
      repass_paid_at: null,
    },
    create: {
      order_id: completedOrder.id,
      freight_platform_brl: ORDER_FINANCIALS_COMPLETED.freightPlatformBrl,
      rider_repass_brl: ORDER_FINANCIALS_COMPLETED.riderRepassBrl,
      platform_commission_brl:
        ORDER_FINANCIALS_COMPLETED.platformCommissionBrl,
      charged_at: ORDER_FINANCIALS_COMPLETED.chargedAt,
      repass_status: "pending",
      repass_paid_at: null,
    },
  });

  const fp = Number(ORDER_FINANCIALS_COMPLETED.freightPlatformBrl);
  const re = Number(ORDER_FINANCIALS_COMPLETED.riderRepassBrl);
  const cp = Number(ORDER_FINANCIALS_COMPLETED.platformCommissionBrl);

  if (fp !== re + cp) {
    throw new Error("Regra financeira invalida no seed: FP deve ser RE + CP.");
  }

  await prisma.payment_intents.upsert({
    where: { order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu },
    update: {
      commerce_user_id: seedIds.users.commerceFarmacia,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "failed",
      amount_brl: FARMACIA_CREDIT_PURCHASE_FAILED.amountBrl,
      amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
      provider_handle: `ip-checkout-${FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu.toLowerCase()}`,
      checkout_url: FARMACIA_CREDIT_PURCHASE_FAILED.checkoutUrl,
      redirect_url: FARMACIA_CREDIT_PURCHASE_FAILED.checkoutUrl,
      webhook_url: "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "failed",
        invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
        transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      },
      expires_at: null,
    },
    create: {
      id: seedIds.finance.paymentIntentFarmaciaFailed,
      commerce_user_id: seedIds.users.commerceFarmacia,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "failed",
      amount_brl: FARMACIA_CREDIT_PURCHASE_FAILED.amountBrl,
      amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
      provider_handle: `ip-checkout-${FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu.toLowerCase()}`,
      order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu,
      checkout_url: FARMACIA_CREDIT_PURCHASE_FAILED.checkoutUrl,
      redirect_url: FARMACIA_CREDIT_PURCHASE_FAILED.checkoutUrl,
      webhook_url: "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "failed",
        invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
        transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      },
      expires_at: null,
    },
  });

  await prisma.payment_intents.upsert({
    where: { order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu },
    update: {
      commerce_user_id: seedIds.users.commerceCentro,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "canceled",
      amount_brl: CENTER_CREDIT_PURCHASE_CANCELED.amountBrl,
      amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
      provider_handle: `ip-checkout-${CENTER_CREDIT_PURCHASE_CANCELED.orderNsu.toLowerCase()}`,
      checkout_url: CENTER_CREDIT_PURCHASE_CANCELED.checkoutUrl,
      redirect_url: CENTER_CREDIT_PURCHASE_CANCELED.checkoutUrl,
      webhook_url: "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "canceled",
        invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
        transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      },
      expires_at: null,
    },
    create: {
      id: seedIds.finance.paymentIntentCentroCanceled,
      commerce_user_id: seedIds.users.commerceCentro,
      provider: "infinitepay",
      purpose: "credit_purchase",
      status: "canceled",
      amount_brl: CENTER_CREDIT_PURCHASE_CANCELED.amountBrl,
      amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
      provider_handle: `ip-checkout-${CENTER_CREDIT_PURCHASE_CANCELED.orderNsu.toLowerCase()}`,
      order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu,
      checkout_url: CENTER_CREDIT_PURCHASE_CANCELED.checkoutUrl,
      redirect_url: CENTER_CREDIT_PURCHASE_CANCELED.checkoutUrl,
      webhook_url: "http://localhost:3333/v1/payments/infinitepay/webhook",
      request_payload: {
        amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
        purpose: "credit_purchase",
      },
      response_payload: {
        status: "canceled",
        invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
        transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      },
      expires_at: null,
    },
  });

  const failedPaymentIntent = await prisma.payment_intents.findUniqueOrThrow({
    where: { order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu },
    select: { id: true },
  });

  const canceledPaymentIntent = await prisma.payment_intents.findUniqueOrThrow({
    where: { order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu },
    select: { id: true },
  });

  await prisma.payment_transactions.upsert({
    where: { id: seedIds.finance.paymentTransactionFarmaciaFailed },
    update: {
      payment_intent_id: failedPaymentIntent.id,
      provider: "infinitepay",
      status: "failed",
      invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
      transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      capture_method: "pix",
      amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
      paid_amount_cents: null,
      installments: 1,
      receipt_url: null,
      provider_payload: {
        gateway: "infinitepay",
        status: "failed",
        reason: "gateway_declined",
      },
      approved_at: null,
    },
    create: {
      id: seedIds.finance.paymentTransactionFarmaciaFailed,
      payment_intent_id: failedPaymentIntent.id,
      provider: "infinitepay",
      status: "failed",
      invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
      transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      capture_method: "pix",
      amount_cents: FARMACIA_CREDIT_PURCHASE_FAILED.amountCents,
      paid_amount_cents: null,
      installments: 1,
      receipt_url: null,
      provider_payload: {
        gateway: "infinitepay",
        status: "failed",
        reason: "gateway_declined",
      },
      approved_at: null,
    },
  });

  await prisma.payment_transactions.upsert({
    where: { id: seedIds.finance.paymentTransactionCentroCanceled },
    update: {
      payment_intent_id: canceledPaymentIntent.id,
      provider: "infinitepay",
      status: "canceled",
      invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      capture_method: "pix",
      amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
      paid_amount_cents: null,
      installments: 1,
      receipt_url: null,
      provider_payload: {
        gateway: "infinitepay",
        status: "canceled",
        reason: "user_aborted_checkout",
      },
      approved_at: null,
    },
    create: {
      id: seedIds.finance.paymentTransactionCentroCanceled,
      payment_intent_id: canceledPaymentIntent.id,
      provider: "infinitepay",
      status: "canceled",
      invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      capture_method: "pix",
      amount_cents: CENTER_CREDIT_PURCHASE_CANCELED.amountCents,
      paid_amount_cents: null,
      installments: 1,
      receipt_url: null,
      provider_payload: {
        gateway: "infinitepay",
        status: "canceled",
        reason: "user_aborted_checkout",
      },
      approved_at: null,
    },
  });

  await prisma.payment_webhook_events.upsert({
    where: {
      idempotency_key: seedIds.finance.webhookIdempotencyFarmaciaFailed,
    },
    update: {
      provider: "infinitepay",
      event_key: "payment.failed",
      invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
      transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu,
      payload: buildFailedWebhookPayload(),
      processing_status: "processed",
      error_message: "gateway_declined",
      received_at: FARMACIA_CREDIT_PURCHASE_FAILED.webhookReceivedAt,
      processed_at: FARMACIA_CREDIT_PURCHASE_FAILED.webhookProcessedAt,
    },
    create: {
      provider: "infinitepay",
      event_key: "payment.failed",
      invoice_slug: FARMACIA_CREDIT_PURCHASE_FAILED.invoiceSlug,
      transaction_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.transactionNsu,
      order_nsu: FARMACIA_CREDIT_PURCHASE_FAILED.orderNsu,
      idempotency_key: seedIds.finance.webhookIdempotencyFarmaciaFailed,
      payload: buildFailedWebhookPayload(),
      processing_status: "processed",
      error_message: "gateway_declined",
      received_at: FARMACIA_CREDIT_PURCHASE_FAILED.webhookReceivedAt,
      processed_at: FARMACIA_CREDIT_PURCHASE_FAILED.webhookProcessedAt,
    },
  });

  await prisma.payment_webhook_events.upsert({
    where: {
      idempotency_key: seedIds.finance.webhookIdempotencyCentroCanceled,
    },
    update: {
      provider: "infinitepay",
      event_key: "payment.canceled",
      invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu,
      payload: buildCanceledWebhookPayload(),
      processing_status: "processed",
      error_message: "user_aborted_checkout",
      received_at: CENTER_CREDIT_PURCHASE_CANCELED.webhookReceivedAt,
      processed_at: CENTER_CREDIT_PURCHASE_CANCELED.webhookProcessedAt,
    },
    create: {
      provider: "infinitepay",
      event_key: "payment.canceled",
      invoice_slug: CENTER_CREDIT_PURCHASE_CANCELED.invoiceSlug,
      transaction_nsu: CENTER_CREDIT_PURCHASE_CANCELED.transactionNsu,
      order_nsu: CENTER_CREDIT_PURCHASE_CANCELED.orderNsu,
      idempotency_key: seedIds.finance.webhookIdempotencyCentroCanceled,
      payload: buildCanceledWebhookPayload(),
      processing_status: "processed",
      error_message: "user_aborted_checkout",
      received_at: CENTER_CREDIT_PURCHASE_CANCELED.webhookReceivedAt,
      processed_at: CENTER_CREDIT_PURCHASE_CANCELED.webhookProcessedAt,
    },
  });
}
