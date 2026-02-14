import { createHash, randomUUID } from "node:crypto";

import type { Prisma, payment_status } from "@prisma/client";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";
import { logger } from "@core/observability/logger";
import type {
  CreateCreditPurchaseIntentRequest,
  AdminPaymentTransactionListQuery,
  InfinitePayWebhookPayload,
  PaymentCheckRequest,
} from "@modules/payments/domain/payments.schemas";
import { InfinitePayClient } from "@modules/payments/infra/infinitepay.client";
import { PaymentsRepository } from "@modules/payments/infra/payments.repository";

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const toMoneyString = (value: number): string => {
  return roundMoney(value).toFixed(2);
};

const generateOrderNsu = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `CRD-${timestamp}-${randomUUID().slice(0, 8)}`;
};

const buildWebhookIdempotencyKey = (payload: InfinitePayWebhookPayload): string => {
  const source = [
    "infinitepay",
    payload.order_nsu,
    payload.transaction_nsu,
    payload.invoice_slug,
    String(payload.paid_amount),
    payload.capture_method,
  ].join(":");

  return createHash("sha256").update(source).digest("hex");
};

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "unknown_error";
};

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};

export class PaymentsService {
  constructor(
    private readonly paymentsRepository = new PaymentsRepository(),
    private readonly infinitePayClient = new InfinitePayClient(),
  ) {}

  private async assertCommerceUser(userId: string): Promise<void> {
    const commerceUser = await this.paymentsRepository.findActiveCommerceUserById(userId);
    if (!commerceUser) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "User is not allowed to access commerce payments.",
        statusCode: 403,
      });
    }
  }

  public async createCreditPurchaseIntent(input: {
    commerceUserId: string;
    payload: CreateCreditPurchaseIntentRequest;
  }): Promise<{
    success: true;
    data: {
      payment_id: string;
      provider: "infinitepay";
      checkout_url: string;
      order_nsu: string;
      provider_payload: Record<string, unknown>;
    };
  }> {
    await this.assertCommerceUser(input.commerceUserId);

    if (!env.infinitePayHandle) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay handle is not configured.",
        statusCode: 503,
      });
    }

    const amountBrl = roundMoney(input.payload.amount_brl);
    const amountCents = Math.round(amountBrl * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid amount for credits purchase.",
        statusCode: 400,
      });
    }

    const orderNsu = generateOrderNsu();
    const redirectUrl = input.payload.redirect_url;
    const webhookUrl = input.payload.webhook_url ?? env.infinitePayWebhookUrl;

    const paymentIntent = await this.paymentsRepository.createPaymentIntent({
      commerceUserId: input.commerceUserId,
      providerHandle: env.infinitePayHandle,
      orderNsu,
      amountBrl: toMoneyString(amountBrl),
      amountCents,
      redirectUrl,
      webhookUrl,
      requestPayload: toInputJsonValue({
        amount_brl: amountBrl,
        amount_cents: amountCents,
        order_nsu: orderNsu,
        ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
        ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
      }),
    });

    try {
      const checkoutResult = await this.infinitePayClient.createCheckoutLink({
        handle: env.infinitePayHandle,
        amountCents,
        orderNsu,
        redirectUrl,
        webhookUrl,
      });

      await this.paymentsRepository.updatePaymentIntentCheckout({
        paymentIntentId: paymentIntent.id,
        checkoutUrl: checkoutResult.checkoutUrl,
        providerPayload: toInputJsonValue(checkoutResult.providerPayload),
      });

      return {
        success: true,
        data: {
          payment_id: paymentIntent.id,
          provider: "infinitepay",
          checkout_url: checkoutResult.checkoutUrl,
          order_nsu: paymentIntent.order_nsu,
          provider_payload: checkoutResult.providerPayload,
        },
      };
    } catch (error: unknown) {
      await this.paymentsRepository.markPaymentIntentFailed(paymentIntent.id, {
        reason: normalizeErrorMessage(error),
      });
      throw error;
    }
  }

  public async checkCommercePayment(input: {
    commerceUserId: string;
    paymentId: string;
    payload: PaymentCheckRequest;
  }): Promise<{
    success: boolean;
    paid: boolean;
    amount: number;
    paid_amount: number;
    installments: number;
    capture_method: "pix" | "credit_card";
  }> {
    await this.assertCommerceUser(input.commerceUserId);

    const paymentIntent = await this.paymentsRepository.findPaymentIntentByIdForCommerce(
      input.paymentId,
      input.commerceUserId,
    );

    if (!paymentIntent) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Payment intent not found.",
        statusCode: 404,
      });
    }

    if (input.payload.order_nsu !== paymentIntent.order_nsu) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "order_nsu does not match payment intent.",
        statusCode: 400,
      });
    }

    if (input.payload.handle !== paymentIntent.provider_handle) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "handle does not match payment intent.",
        statusCode: 400,
      });
    }

    const checkResult = await this.infinitePayClient.checkPaymentStatus({
      handle: input.payload.handle,
      orderNsu: input.payload.order_nsu,
      transactionNsu: input.payload.transaction_nsu,
      slug: input.payload.slug,
    });

    if (checkResult.result.paid) {
      await this.paymentsRepository.applyApprovedPayment({
        paymentIntentId: paymentIntent.id,
        invoiceSlug: input.payload.slug,
        transactionNsu: input.payload.transaction_nsu,
        captureMethod: checkResult.result.capture_method,
        amountCents: checkResult.result.amount,
        paidAmountCents: checkResult.result.paid_amount,
        installments: checkResult.result.installments,
        providerPayload: toInputJsonValue(checkResult.providerPayload),
      });
    } else {
      const mappedStatus: payment_status = checkResult.result.success ? "pending" : "failed";

      await this.paymentsRepository.syncPaymentCheck({
        paymentIntentId: paymentIntent.id,
        status: mappedStatus,
        invoiceSlug: input.payload.slug,
        transactionNsu: input.payload.transaction_nsu,
        captureMethod: checkResult.result.capture_method,
        amountCents: checkResult.result.amount,
        paidAmountCents: checkResult.result.paid_amount,
        installments: checkResult.result.installments,
        providerPayload: toInputJsonValue(checkResult.providerPayload),
      });
    }

    return {
      success: checkResult.result.success,
      paid: checkResult.result.paid,
      amount: checkResult.result.amount,
      paid_amount: checkResult.result.paid_amount,
      installments: checkResult.result.installments,
      capture_method: checkResult.result.capture_method,
    };
  }

  public async processInfinitePayWebhook(input: {
    payload: InfinitePayWebhookPayload;
    providedSecret?: string;
  }): Promise<{ processed: boolean; idempotent: boolean }> {
    if (
      env.infinitePayWebhookSecret &&
      input.providedSecret !== env.infinitePayWebhookSecret
    ) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid webhook secret.",
        statusCode: 400,
      });
    }

    const idempotencyKey = buildWebhookIdempotencyKey(input.payload);
    const webhookEvent = await this.paymentsRepository.createWebhookEvent({
      idempotencyKey,
      eventKey: "payment.approved",
      orderNsu: input.payload.order_nsu,
      transactionNsu: input.payload.transaction_nsu,
      invoiceSlug: input.payload.invoice_slug,
      payload: toInputJsonValue(input.payload),
    });

    if (!webhookEvent.created) {
      return {
        processed: true,
        idempotent: true,
      };
    }

    try {
      const paymentIntent = await this.paymentsRepository.findPaymentIntentByOrderNsu(
        input.payload.order_nsu,
      );

      if (!paymentIntent) {
        throw new AppError({
          code: "BAD_REQUEST",
          message: "order_nsu not found.",
          statusCode: 400,
        });
      }

      await this.paymentsRepository.applyApprovedPayment({
        paymentIntentId: paymentIntent.id,
        invoiceSlug: input.payload.invoice_slug,
        transactionNsu: input.payload.transaction_nsu,
        captureMethod: input.payload.capture_method,
        amountCents: input.payload.amount,
        paidAmountCents: input.payload.paid_amount,
        installments: input.payload.installments,
        receiptUrl: input.payload.receipt_url,
        providerPayload: toInputJsonValue(input.payload),
      });

      await this.paymentsRepository.markWebhookEventProcessed(idempotencyKey);

      return {
        processed: true,
        idempotent: false,
      };
    } catch (error: unknown) {
      const errorMessage = normalizeErrorMessage(error);
      await this.paymentsRepository.markWebhookEventFailed(idempotencyKey, errorMessage);
      throw error;
    }
  }

  private toAdminPaymentTransactionPayload(item: {
    id: string;
    provider: "infinitepay";
    status: "pending" | "approved" | "failed" | "canceled";
    amount_cents: number;
    paid_amount_cents: number | null;
    transaction_nsu: string | null;
    capture_method: "pix" | "credit_card" | null;
    created_at: Date;
    payment_intents: { order_nsu: string };
  }): Record<string, unknown> {
    const amountBrl = roundMoney(item.amount_cents / 100);
    const paidAmountBrl =
      item.paid_amount_cents !== null ? roundMoney(item.paid_amount_cents / 100) : undefined;

    return {
      id: item.id,
      provider: item.provider,
      status: item.status,
      amount_brl: amountBrl,
      ...(paidAmountBrl !== undefined ? { paid_amount_brl: paidAmountBrl } : {}),
      ...(item.payment_intents?.order_nsu ? { order_nsu: item.payment_intents.order_nsu } : {}),
      ...(item.transaction_nsu ? { transaction_nsu: item.transaction_nsu } : {}),
      ...(item.capture_method ? { capture_method: item.capture_method } : {}),
      created_at: item.created_at.toISOString(),
    };
  }

  public async listAdminPaymentTransactions(
    query: AdminPaymentTransactionListQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const { items, total } = await this.paymentsRepository.listAdminPaymentTransactions({
      page: query.page,
      limit: query.limit,
      status: query.status,
    });

    return {
      success: true,
      data: items.map((item) =>
        this.toAdminPaymentTransactionPayload({
          id: item.id,
          provider: item.provider,
          status: item.status,
          amount_cents: item.amount_cents,
          paid_amount_cents: item.paid_amount_cents ?? null,
          transaction_nsu: item.transaction_nsu ?? null,
          capture_method: item.capture_method ?? null,
          created_at: item.created_at,
          payment_intents: item.payment_intents,
        }),
      ),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async getAdminPaymentTransaction(transactionId: string): Promise<Record<string, unknown>> {
    const transaction = await this.paymentsRepository.findAdminPaymentTransactionById(transactionId);
    if (!transaction) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Payment transaction not found.",
        statusCode: 404,
      });
    }

    return this.toAdminPaymentTransactionPayload({
      id: transaction.id,
      provider: transaction.provider,
      status: transaction.status,
      amount_cents: transaction.amount_cents,
      paid_amount_cents: transaction.paid_amount_cents ?? null,
      transaction_nsu: transaction.transaction_nsu ?? null,
      capture_method: transaction.capture_method ?? null,
      created_at: transaction.created_at,
      payment_intents: transaction.payment_intents,
    });
  }

  public async consolidateOrderFinancials(orderId: string): Promise<void> {
    try {
      await this.paymentsRepository.consolidateOrderFinancials(orderId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "INVALID_ORDER_FINANCIALS_FORMULA") {
        throw new AppError({
          code: "CONFLICT",
          message: "Order financial formula is invalid. Expected FP = RE + CP.",
          statusCode: 409,
        });
      }

      logger.error(
        {
          order_id: orderId,
          error,
        },
        "order_financials_consolidation_failed",
      );
      throw error;
    }
  }
}
