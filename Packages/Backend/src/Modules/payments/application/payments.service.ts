import { createHash, randomUUID } from "node:crypto";

import type { Prisma, payment_status } from "@prisma/client";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";
import { logger } from "@core/observability/logger";
import { DispatchService } from "@modules/dispatch/application/dispatch.service";
import type {
  AdminPaymentTransactionListQuery,
  CreateCreditPurchaseIntentRequest,
  CreateOrderPaymentIntentRequest,
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

const generateOrderNsu = (prefix: "CRD" | "ORD"): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `${prefix}-${timestamp}-${randomUUID().slice(0, 8)}`;
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
    private readonly dispatchService = new DispatchService(),
  ) {}

  private async openDispatchAfterOrderPayment(input?: {
    orderId: string;
    zone: number | null;
    shouldOpenDispatch: boolean;
  }): Promise<void> {
    if (!input?.shouldOpenDispatch) {
      return;
    }

    try {
      await this.dispatchService.openInitialDispatch(input.orderId, input.zone);
    } catch (error: unknown) {
      logger.warn(
        {
          order_id: input.orderId,
          zone: input.zone,
          error,
        },
        "initial_dispatch_failed_after_order_payment",
      );
    }
  }

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

    const orderNsu = generateOrderNsu("CRD");
    const redirectUrl = input.payload.redirect_url;
    const webhookUrl = input.payload.webhook_url ?? env.infinitePayWebhookUrl;

    const paymentIntent = await this.paymentsRepository.createPaymentIntent({
      commerceUserId: input.commerceUserId,
      providerHandle: env.infinitePayHandle,
      purpose: "credit_purchase",
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

  private toOrderPaymentIntentPayload(paymentIntent: {
    id: string;
    order_id: string | null;
    provider: "infinitepay";
    purpose: string;
    status: payment_status;
    checkout_url: string;
    order_nsu: string;
    amount_brl: Prisma.Decimal;
    expires_at: Date | null;
    response_payload: Prisma.JsonValue | null;
  }): Record<string, unknown> {
    return {
      payment_id: paymentIntent.id,
      ...(paymentIntent.order_id ? { order_id: paymentIntent.order_id } : {}),
      provider: paymentIntent.provider,
      purpose: paymentIntent.purpose,
      status: paymentIntent.status,
      checkout_url: paymentIntent.checkout_url,
      order_nsu: paymentIntent.order_nsu,
      amount_brl: roundMoney(Number(paymentIntent.amount_brl)),
      ...(paymentIntent.expires_at ? { expires_at: paymentIntent.expires_at.toISOString() } : {}),
      ...(paymentIntent.response_payload &&
      typeof paymentIntent.response_payload === "object" &&
      !Array.isArray(paymentIntent.response_payload)
        ? { provider_payload: paymentIntent.response_payload }
        : {}),
    };
  }

  public async createOrderPaymentIntent(input: {
    commerceUserId: string;
    orderId: string;
    payload: CreateOrderPaymentIntentRequest;
  }): Promise<{
    success: true;
    data: Record<string, unknown>;
  }> {
    await this.assertCommerceUser(input.commerceUserId);

    if (!env.infinitePayHandle) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay handle is not configured.",
        statusCode: 503,
      });
    }

    const order = await this.paymentsRepository.findCommerceOrderById(
      input.orderId,
      input.commerceUserId,
    );

    if (!order) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    if (order.status === "canceled" || order.status === "completed") {
      throw new AppError({
        code: "CONFLICT",
        message: "Order state does not allow payment intent creation.",
        statusCode: 409,
      });
    }

    if (!order.payment_required) {
      throw new AppError({
        code: "CONFLICT",
        message: "Order does not require payment intent.",
        statusCode: 409,
      });
    }

    if (order.payment_status === "approved") {
      throw new AppError({
        code: "CONFLICT",
        message: "Order is already paid.",
        statusCode: 409,
      });
    }

    const amountBrl = Number(order.total_brl ?? 0);
    const amountCents = Math.round(roundMoney(amountBrl) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new AppError({
        code: "CONFLICT",
        message: "Order has invalid total amount for payment.",
        statusCode: 409,
      });
    }

    const orderNsu = generateOrderNsu("ORD");
    const redirectUrl = input.payload.redirect_url;
    const webhookUrl = input.payload.webhook_url ?? env.infinitePayWebhookUrl;

    const paymentIntent = await this.paymentsRepository.createPaymentIntent({
      commerceUserId: input.commerceUserId,
      providerHandle: env.infinitePayHandle,
      purpose: "order_payment",
      orderId: order.id,
      orderNsu,
      amountBrl: toMoneyString(amountBrl),
      amountCents,
      redirectUrl,
      webhookUrl,
      requestPayload: toInputJsonValue({
        order_id: order.id,
        amount_brl: roundMoney(amountBrl),
        amount_cents: amountCents,
        order_nsu: orderNsu,
        ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
        ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
        ...(input.payload.customer ? { customer: input.payload.customer } : {}),
        ...(input.payload.address ? { address: input.payload.address } : {}),
      }),
    });

    await this.paymentsRepository.markOrderPaymentPending(order.id);

    try {
      const checkoutResult = await this.infinitePayClient.createCheckoutLink({
        handle: env.infinitePayHandle,
        amountCents,
        orderNsu,
        description: "Pagamento de entrega Roodi",
        redirectUrl,
        webhookUrl,
        customer: input.payload.customer,
        address: input.payload.address,
      });

      await this.paymentsRepository.updatePaymentIntentCheckout({
        paymentIntentId: paymentIntent.id,
        checkoutUrl: checkoutResult.checkoutUrl,
        providerPayload: toInputJsonValue(checkoutResult.providerPayload),
      });

      const latestPaymentIntent = await this.paymentsRepository.findLatestOrderPaymentIntentForCommerce(
        order.id,
        input.commerceUserId,
      );

      if (!latestPaymentIntent || !latestPaymentIntent.checkout_url) {
        throw new AppError({
          code: "NOT_FOUND",
          message: "Order payment intent not found after creation.",
          statusCode: 404,
        });
      }

      return {
        success: true,
        data: this.toOrderPaymentIntentPayload({
          ...latestPaymentIntent,
          checkout_url: latestPaymentIntent.checkout_url,
        }),
      };
    } catch (error: unknown) {
      await this.paymentsRepository.markPaymentIntentFailed(paymentIntent.id, {
        reason: normalizeErrorMessage(error),
      });
      throw error;
    }
  }

  public async getOrderPaymentStatus(input: {
    commerceUserId: string;
    orderId: string;
  }): Promise<{
    success: true;
    data: Record<string, unknown>;
  }> {
    await this.assertCommerceUser(input.commerceUserId);

    const order = await this.paymentsRepository.findCommerceOrderById(
      input.orderId,
      input.commerceUserId,
    );

    if (!order) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    const latestPaymentIntent = await this.paymentsRepository.findLatestOrderPaymentIntentForCommerce(
      order.id,
      input.commerceUserId,
    );

    return {
      success: true,
      data: {
        order_id: order.id,
        payment_status: order.payment_status,
        paid: order.payment_status === "approved",
        ...(latestPaymentIntent?.checkout_url
          ? {
              payment: this.toOrderPaymentIntentPayload({
                ...latestPaymentIntent,
                checkout_url: latestPaymentIntent.checkout_url,
              }),
            }
          : {}),
      },
    };
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
      const paymentResult = await this.paymentsRepository.applyApprovedPayment({
        paymentIntentId: paymentIntent.id,
        invoiceSlug: input.payload.slug,
        transactionNsu: input.payload.transaction_nsu,
        captureMethod: checkResult.result.capture_method,
        amountCents: checkResult.result.amount,
        paidAmountCents: checkResult.result.paid_amount,
        installments: checkResult.result.installments,
        providerPayload: toInputJsonValue(checkResult.providerPayload),
      });

      await this.openDispatchAfterOrderPayment(paymentResult.orderPayment);
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

      const paymentResult = await this.paymentsRepository.applyApprovedPayment({
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

      await this.openDispatchAfterOrderPayment(paymentResult.orderPayment);

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
