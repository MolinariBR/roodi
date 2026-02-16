import { Prisma, type PrismaClient, type payment_capture_method, type payment_status } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";

type CreatePaymentIntentInput = {
  commerceUserId: string;
  providerHandle: string;
  purpose: string;
  orderId?: string;
  orderNsu: string;
  amountBrl: string;
  amountCents: number;
  redirectUrl?: string;
  webhookUrl?: string;
  requestPayload?: Prisma.InputJsonValue;
};

type PaymentIntentCheckoutUpdateInput = {
  paymentIntentId: string;
  checkoutUrl: string;
  providerPayload?: Prisma.InputJsonValue;
  expiresAt?: Date;
};

type SyncPaymentCheckInput = {
  paymentIntentId: string;
  status: payment_status;
  invoiceSlug: string;
  transactionNsu: string;
  captureMethod: payment_capture_method;
  amountCents: number;
  paidAmountCents: number;
  installments: number;
  providerPayload?: Prisma.InputJsonValue;
};

type ApplyApprovedPaymentInput = {
  paymentIntentId: string;
  invoiceSlug: string;
  transactionNsu: string;
  captureMethod: payment_capture_method;
  amountCents: number;
  paidAmountCents: number;
  installments: number;
  receiptUrl?: string;
  providerPayload?: Prisma.InputJsonValue;
  approvedAt?: Date;
};

type CreateWebhookEventInput = {
  idempotencyKey: string;
  eventKey: string;
  orderNsu: string;
  transactionNsu: string;
  invoiceSlug: string;
  payload: Prisma.InputJsonValue;
};

type AdminPaymentTransactionRecord = Prisma.payment_transactionsGetPayload<{
  include: {
    payment_intents: {
      select: {
        order_nsu: true;
      };
    };
  };
}>;

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const toMoneyString = (value: number): string => {
  return roundMoney(value).toFixed(2);
};

export class PaymentsRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findActiveCommerceUserById(userId: string): Promise<{
    id: string;
    role: "admin" | "commerce" | "rider";
    status: string;
  } | null> {
    return this.prismaClient.users.findFirst({
      where: {
        id: userId,
        role: "commerce",
        status: "active",
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });
  }

  public createPaymentIntent(input: CreatePaymentIntentInput): Promise<{
    id: string;
    order_id: string | null;
    purpose: string;
    order_nsu: string;
    amount_brl: Prisma.Decimal;
    amount_cents: number;
    commerce_user_id: string;
    provider_handle: string;
    checkout_url: string | null;
    status: payment_status;
  }> {
    return this.prismaClient.payment_intents.create({
      data: {
        commerce_user_id: input.commerceUserId,
        provider: "infinitepay",
        purpose: input.purpose,
        order_id: input.orderId,
        status: "pending",
        amount_brl: input.amountBrl,
        amount_cents: input.amountCents,
        provider_handle: input.providerHandle,
        order_nsu: input.orderNsu,
        redirect_url: input.redirectUrl,
        webhook_url: input.webhookUrl,
        request_payload: input.requestPayload,
      },
      select: {
        id: true,
        order_id: true,
        purpose: true,
        order_nsu: true,
        amount_brl: true,
        amount_cents: true,
        commerce_user_id: true,
        provider_handle: true,
        checkout_url: true,
        status: true,
      },
    });
  }

  public updatePaymentIntentCheckout(input: PaymentIntentCheckoutUpdateInput): Promise<void> {
    return this.prismaClient.payment_intents
      .update({
        where: {
          id: input.paymentIntentId,
        },
        data: {
          status: "pending",
          checkout_url: input.checkoutUrl,
          response_payload: input.providerPayload,
          expires_at: input.expiresAt,
          updated_at: new Date(),
        },
      })
      .then(() => undefined);
  }

  public markPaymentIntentFailed(
    paymentIntentId: string,
    providerPayload?: Prisma.InputJsonValue,
  ): Promise<void> {
    return this.prismaClient.payment_intents
      .update({
        where: {
          id: paymentIntentId,
        },
        data: {
          status: "failed",
          response_payload: providerPayload,
          updated_at: new Date(),
        },
      })
      .then(() => undefined);
  }

  public findPaymentIntentByIdForCommerce(
    paymentIntentId: string,
    commerceUserId: string,
  ): Promise<{
    id: string;
    order_id: string | null;
    purpose: string;
    order_nsu: string;
    provider_handle: string;
    amount_brl: Prisma.Decimal;
    amount_cents: number;
    status: payment_status;
    commerce_user_id: string;
  } | null> {
    return this.prismaClient.payment_intents.findFirst({
      where: {
        id: paymentIntentId,
        commerce_user_id: commerceUserId,
      },
      select: {
        id: true,
        order_id: true,
        purpose: true,
        order_nsu: true,
        provider_handle: true,
        amount_brl: true,
        amount_cents: true,
        status: true,
        commerce_user_id: true,
      },
    });
  }

  public findCommerceOrderById(
    orderId: string,
    commerceUserId: string,
  ): Promise<{
    id: string;
    status: string;
    total_brl: Prisma.Decimal | null;
    payment_status: payment_status;
    payment_required: boolean;
    payment_confirmed_at: Date | null;
  } | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        id: orderId,
        commerce_user_id: commerceUserId,
      },
      select: {
        id: true,
        status: true,
        total_brl: true,
        payment_status: true,
        payment_required: true,
        payment_confirmed_at: true,
      },
    });
  }

  public findLatestOrderPaymentIntentForCommerce(
    orderId: string,
    commerceUserId: string,
  ): Promise<{
    id: string;
    order_id: string | null;
    purpose: string;
    status: payment_status;
    provider: "infinitepay";
    order_nsu: string;
    amount_brl: Prisma.Decimal;
    checkout_url: string | null;
    expires_at: Date | null;
    response_payload: Prisma.JsonValue | null;
  } | null> {
    return this.prismaClient.payment_intents.findFirst({
      where: {
        commerce_user_id: commerceUserId,
        order_id: orderId,
        purpose: "order_payment",
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        order_id: true,
        purpose: true,
        status: true,
        provider: true,
        order_nsu: true,
        amount_brl: true,
        checkout_url: true,
        expires_at: true,
        response_payload: true,
      },
    });
  }

  public markOrderPaymentPending(orderId: string): Promise<void> {
    return this.prismaClient.orders
      .updateMany({
        where: {
          id: orderId,
          payment_status: {
            not: "approved",
          },
        },
        data: {
          payment_status: "pending",
          payment_confirmed_at: null,
          updated_at: new Date(),
        },
      })
      .then(() => undefined);
  }

  public findPaymentIntentByOrderNsu(orderNsu: string): Promise<{
    id: string;
    order_id: string | null;
    purpose: string;
    order_nsu: string;
    commerce_user_id: string;
    amount_brl: Prisma.Decimal;
    amount_cents: number;
    status: payment_status;
  } | null> {
    return this.prismaClient.payment_intents.findUnique({
      where: {
        order_nsu: orderNsu,
      },
      select: {
        id: true,
        order_id: true,
        purpose: true,
        order_nsu: true,
        commerce_user_id: true,
        amount_brl: true,
        amount_cents: true,
        status: true,
      },
    });
  }

  public async syncPaymentCheck(input: SyncPaymentCheckInput): Promise<void> {
    const now = new Date();

    await this.prismaClient.$transaction(async (tx) => {
      const paymentIntent = await tx.payment_intents.findUnique({
        where: {
          id: input.paymentIntentId,
        },
        select: {
          purpose: true,
          order_id: true,
        },
      });

      if (!paymentIntent) {
        throw new Error("PAYMENT_INTENT_NOT_FOUND");
      }

      await tx.payment_intents.update({
        where: {
          id: input.paymentIntentId,
        },
        data: {
          status: input.status,
          response_payload: input.providerPayload,
          updated_at: now,
        },
      });

      await tx.payment_transactions.upsert({
        where: {
          provider_transaction_nsu: {
            provider: "infinitepay",
            transaction_nsu: input.transactionNsu,
          },
        },
        update: {
          status: input.status,
          invoice_slug: input.invoiceSlug,
          capture_method: input.captureMethod,
          amount_cents: input.amountCents,
          paid_amount_cents: input.paidAmountCents,
          installments: input.installments,
          provider_payload: input.providerPayload,
          approved_at: input.status === "approved" ? now : null,
          updated_at: now,
        },
        create: {
          payment_intent_id: input.paymentIntentId,
          provider: "infinitepay",
          status: input.status,
          invoice_slug: input.invoiceSlug,
          transaction_nsu: input.transactionNsu,
          capture_method: input.captureMethod,
          amount_cents: input.amountCents,
          paid_amount_cents: input.paidAmountCents,
          installments: input.installments,
          provider_payload: input.providerPayload,
          approved_at: input.status === "approved" ? now : null,
        },
      });

      if (paymentIntent.purpose === "order_payment" && paymentIntent.order_id) {
        if (input.status === "approved") {
          await tx.orders.update({
            where: {
              id: paymentIntent.order_id,
            },
            data: {
              payment_status: "approved",
              payment_confirmed_at: now,
              updated_at: now,
            },
          });
        } else {
          await tx.orders.updateMany({
            where: {
              id: paymentIntent.order_id,
              payment_status: {
                not: "approved",
              },
            },
            data: {
              payment_status: input.status,
              updated_at: now,
            },
          });
        }
      }
    });
  }

  public async applyApprovedPayment(input: ApplyApprovedPaymentInput): Promise<{
    alreadyCredited: boolean;
    orderPayment?: {
      orderId: string;
      zone: number | null;
      shouldOpenDispatch: boolean;
    };
  }> {
    const approvedAt = input.approvedAt ?? new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const paymentIntent = await tx.payment_intents.findUnique({
        where: {
          id: input.paymentIntentId,
        },
      });

      if (!paymentIntent) {
        throw new Error("PAYMENT_INTENT_NOT_FOUND");
      }

      await tx.payment_intents.update({
        where: {
          id: paymentIntent.id,
        },
        data: {
          status: "approved",
          response_payload: input.providerPayload,
          updated_at: approvedAt,
        },
      });

      await tx.payment_transactions.upsert({
        where: {
          provider_transaction_nsu: {
            provider: "infinitepay",
            transaction_nsu: input.transactionNsu,
          },
        },
        update: {
          status: "approved",
          invoice_slug: input.invoiceSlug,
          capture_method: input.captureMethod,
          amount_cents: input.amountCents,
          paid_amount_cents: input.paidAmountCents,
          installments: input.installments,
          receipt_url: input.receiptUrl,
          provider_payload: input.providerPayload,
          approved_at: approvedAt,
          updated_at: approvedAt,
        },
        create: {
          payment_intent_id: paymentIntent.id,
          provider: "infinitepay",
          status: "approved",
          invoice_slug: input.invoiceSlug,
          transaction_nsu: input.transactionNsu,
          capture_method: input.captureMethod,
          amount_cents: input.amountCents,
          paid_amount_cents: input.paidAmountCents,
          installments: input.installments,
          receipt_url: input.receiptUrl,
          provider_payload: input.providerPayload,
          approved_at: approvedAt,
        },
      });

      if (paymentIntent.purpose === "order_payment") {
        if (!paymentIntent.order_id) {
          throw new Error("ORDER_PAYMENT_INTENT_WITHOUT_ORDER");
        }

        const currentOrder = await tx.orders.findUnique({
          where: {
            id: paymentIntent.order_id,
          },
          select: {
            id: true,
            status: true,
            zone: true,
          },
        });

        if (!currentOrder) {
          throw new Error("ORDER_NOT_FOUND");
        }

        const shouldOpenDispatch = currentOrder.status === "created";

        await tx.orders.update({
          where: {
            id: paymentIntent.order_id,
          },
          data: {
            ...(shouldOpenDispatch ? { status: "searching_rider" } : {}),
            payment_status: "approved",
            payment_confirmed_at: approvedAt,
            updated_at: approvedAt,
          },
        });

        return {
          alreadyCredited: false,
          orderPayment: {
            orderId: currentOrder.id,
            zone: currentOrder.zone,
            shouldOpenDispatch,
          },
        };
      }

      const existingCreditEntry = await tx.credits_ledger.findFirst({
        where: {
          commerce_user_id: paymentIntent.commerce_user_id,
          entry_type: "credit",
          reference_type: "payment_intent",
          reference_id: paymentIntent.id,
        },
      });

      if (existingCreditEntry) {
        return {
          alreadyCredited: true,
        };
      }

      await tx.credits_wallets.upsert({
        where: {
          commerce_user_id: paymentIntent.commerce_user_id,
        },
        create: {
          commerce_user_id: paymentIntent.commerce_user_id,
          balance_brl: 0,
          reserved_brl: 0,
        },
        update: {},
      });

      const updatedWallet = await tx.credits_wallets.update({
        where: {
          commerce_user_id: paymentIntent.commerce_user_id,
        },
        data: {
          balance_brl: {
            increment: paymentIntent.amount_brl,
          },
          updated_at: approvedAt,
        },
      });

      await tx.credits_ledger.create({
        data: {
          commerce_user_id: paymentIntent.commerce_user_id,
          entry_type: "credit",
          amount_brl: paymentIntent.amount_brl,
          balance_after_brl: updatedWallet.balance_brl,
          reference_type: "payment_intent",
          reference_id: paymentIntent.id,
          reason: "Compra de creditos aprovada via InfinitePay.",
          created_by_user_id: paymentIntent.commerce_user_id,
          created_at: approvedAt,
        },
      });

      return {
        alreadyCredited: false,
      };
    });
  }

  public async createWebhookEvent(input: CreateWebhookEventInput): Promise<{
    created: boolean;
  }> {
    try {
      await this.prismaClient.payment_webhook_events.create({
        data: {
          provider: "infinitepay",
          event_key: input.eventKey,
          invoice_slug: input.invoiceSlug,
          transaction_nsu: input.transactionNsu,
          order_nsu: input.orderNsu,
          idempotency_key: input.idempotencyKey,
          payload: input.payload,
          processing_status: "received",
        },
      });

      return {
        created: true,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          created: false,
        };
      }

      throw error;
    }
  }

  public markWebhookEventProcessed(idempotencyKey: string): Promise<void> {
    return this.prismaClient.payment_webhook_events
      .update({
        where: {
          idempotency_key: idempotencyKey,
        },
        data: {
          processing_status: "processed",
          error_message: null,
          processed_at: new Date(),
        },
      })
      .then(() => undefined);
  }

  public markWebhookEventFailed(idempotencyKey: string, errorMessage: string): Promise<void> {
    return this.prismaClient.payment_webhook_events
      .update({
        where: {
          idempotency_key: idempotencyKey,
        },
        data: {
          processing_status: "failed",
          error_message: errorMessage.slice(0, 500),
          processed_at: null,
        },
      })
      .then(() => undefined);
  }

  public async consolidateOrderFinancials(orderId: string): Promise<{
    consolidated: boolean;
    freightPlatformBrl: number;
    riderRepassBrl: number;
    platformCommissionBrl: number;
  }> {
    return this.prismaClient.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          status: true,
          total_brl: true,
          commerce_user_id: true,
        },
      });

      if (!order || order.status !== "completed" || !order.total_brl) {
        return {
          consolidated: false,
          freightPlatformBrl: 0,
          riderRepassBrl: 0,
          platformCommissionBrl: 0,
        };
      }

      const freightPlatformBrl = roundMoney(Number(order.total_brl));
      const platformCommissionBrl = roundMoney(Math.min(1, freightPlatformBrl));
      const riderRepassBrl = roundMoney(freightPlatformBrl - platformCommissionBrl);

      if (Math.abs(freightPlatformBrl - (riderRepassBrl + platformCommissionBrl)) > 0.009) {
        throw new Error("INVALID_ORDER_FINANCIALS_FORMULA");
      }

      await tx.order_financials.upsert({
        where: {
          order_id: order.id,
        },
        update: {
          freight_platform_brl: toMoneyString(freightPlatformBrl),
          rider_repass_brl: toMoneyString(riderRepassBrl),
          platform_commission_brl: toMoneyString(platformCommissionBrl),
          charged_at: new Date(),
          updated_at: new Date(),
        },
        create: {
          order_id: order.id,
          freight_platform_brl: toMoneyString(freightPlatformBrl),
          rider_repass_brl: toMoneyString(riderRepassBrl),
          platform_commission_brl: toMoneyString(platformCommissionBrl),
          charged_at: new Date(),
        },
      });

      const existingDebitEntry = await tx.credits_ledger.findFirst({
        where: {
          order_id: order.id,
          entry_type: "debit",
        },
      });

      if (!existingDebitEntry) {
        const wallet = await tx.credits_wallets.findUnique({
          where: {
            commerce_user_id: order.commerce_user_id,
          },
        });

        if (wallet) {
          const releasableAmount = wallet.reserved_brl.lt(order.total_brl)
            ? wallet.reserved_brl
            : order.total_brl;

          const walletAfterSettlement = releasableAmount.gt(0)
            ? await tx.credits_wallets.update({
                where: {
                  commerce_user_id: order.commerce_user_id,
                },
                data: {
                  reserved_brl: {
                    decrement: releasableAmount,
                  },
                  updated_at: new Date(),
                },
              })
            : wallet;

          await tx.credits_ledger.create({
            data: {
              commerce_user_id: order.commerce_user_id,
              order_id: order.id,
              entry_type: "debit",
              amount_brl: order.total_brl.mul(-1),
              balance_after_brl: walletAfterSettlement.balance_brl,
              reference_type: "order",
              reference_id: order.id,
              reason: "Debito de frete da entrega concluida.",
              created_by_user_id: order.commerce_user_id,
              created_at: new Date(),
            },
          });
        }
      }

      return {
        consolidated: true,
        freightPlatformBrl,
        riderRepassBrl,
        platformCommissionBrl,
      };
    });
  }

  public async listAdminPaymentTransactions(input: {
    page: number;
    limit: number;
    status?: payment_status;
  }): Promise<{ items: AdminPaymentTransactionRecord[]; total: number }> {
    const where: Prisma.payment_transactionsWhereInput = {
      ...(input.status ? { status: input.status } : {}),
    };

    const skip = (input.page - 1) * input.limit;
    const take = input.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.payment_transactions.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
        include: {
          payment_intents: {
            select: {
              order_nsu: true,
            },
          },
        },
      }),
      this.prismaClient.payment_transactions.count({ where }),
    ]);

    return { items, total };
  }

  public findAdminPaymentTransactionById(transactionId: string): Promise<AdminPaymentTransactionRecord | null> {
    return this.prismaClient.payment_transactions.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        payment_intents: {
          select: {
            order_nsu: true,
          },
        },
      },
    });
  }
}
