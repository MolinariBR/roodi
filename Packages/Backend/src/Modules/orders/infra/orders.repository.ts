import { randomInt } from "node:crypto";

import type { Prisma, PrismaClient, order_status, orders, quotes } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { CreateOrderRequest, OrderListQuery } from "@modules/orders/domain/orders.schemas";

type ListOrdersInput = {
  userId: string;
  query: OrderListQuery;
};

type CreateOrderInput = {
  commerceUserId: string;
  payload: CreateOrderRequest;
  quote: quotes;
};

type CancelOrderInput = {
  orderId: string;
  commerceUserId: string;
  reason: string;
  details?: string;
};

const BASE10_RADIX = 10;
const ORDER_CODE_RANDOM_MIN = 1000;
const ORDER_CODE_RANDOM_MAX = 9999;

const formatOrderCode = (date: Date): string => {
  const compactDate = date.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomSuffix = randomInt(ORDER_CODE_RANDOM_MIN, ORDER_CODE_RANDOM_MAX);
  return `ORD-${compactDate}-${randomSuffix.toString(BASE10_RADIX)}`;
};

export class OrdersRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public async listAdminOrders(query: OrderListQuery): Promise<{ items: orders[]; total: number }> {
    const where: Prisma.ordersWhereInput = {
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.orders.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prismaClient.orders.count({ where }),
    ]);

    return { items, total };
  }

  public findOrderById(orderId: string): Promise<orders | null> {
    return this.prismaClient.orders.findUnique({
      where: {
        id: orderId,
      },
    });
  }

  public async listCommerceOrders(input: ListOrdersInput): Promise<{ items: orders[]; total: number }> {
    const where: Prisma.ordersWhereInput = {
      commerce_user_id: input.userId,
      ...(input.query.status ? { status: input.query.status } : {}),
    };

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.orders.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip: (input.query.page - 1) * input.query.limit,
        take: input.query.limit,
      }),
      this.prismaClient.orders.count({ where }),
    ]);

    return { items, total };
  }

  public findCommerceOrderById(orderId: string, commerceUserId: string): Promise<orders | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        id: orderId,
        commerce_user_id: commerceUserId,
      },
    });
  }

  public listRiderOrderHistory(input: ListOrdersInput): Promise<{ items: orders[]; total: number }> {
    const where: Prisma.ordersWhereInput = {
      rider_user_id: input.userId,
      ...(input.query.status ? { status: input.query.status } : {}),
    };

    return this.prismaClient
      .$transaction([
        this.prismaClient.orders.findMany({
          where,
          orderBy: {
            created_at: "desc",
          },
          skip: (input.query.page - 1) * input.query.limit,
          take: input.query.limit,
        }),
        this.prismaClient.orders.count({ where }),
      ])
      .then(([items, total]) => ({ items, total }));
  }

  public findRiderOrderById(orderId: string, riderUserId: string): Promise<orders | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        id: orderId,
        rider_user_id: riderUserId,
      },
    });
  }

  public findRiderActiveOrder(
    riderUserId: string,
    statuses: readonly order_status[],
  ): Promise<orders | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        rider_user_id: riderUserId,
        status: {
          in: [...statuses],
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });
  }

  public findQuoteByIdForCommerce(quoteId: string, commerceUserId: string): Promise<quotes | null> {
    return this.prismaClient.quotes.findFirst({
      where: {
        id: quoteId,
        commerce_user_id: commerceUserId,
      },
    });
  }

  public async createOrderAwaitingPayment(input: CreateOrderInput): Promise<orders> {
    const now = new Date();
    const totalBrl = input.quote.total_brl;

    if (!totalBrl || Number(totalBrl) <= 0) {
      throw new Error("Quote total_brl must be greater than zero.");
    }

    return this.prismaClient.$transaction(async (tx) => {
      const createdOrder = await tx.orders.create({
        data: {
          order_code: formatOrderCode(now),
          commerce_user_id: input.commerceUserId,
          client_id: input.payload.client_id,
          quote_id: input.quote.id,
          status: "created",
          urgency: input.payload.urgency,
          origin_bairro_id: input.quote.origin_bairro_id,
          destination_bairro_id: input.quote.destination_bairro_id,
          recipient_name: input.payload.recipient_name,
          recipient_phone: input.payload.recipient_phone,
          destination_cep: input.payload.destination.cep,
          destination_state: input.payload.destination.state,
          destination_city: input.payload.destination.city,
          destination_neighborhood: input.payload.destination.neighborhood,
          destination_street: input.payload.destination.street,
          destination_number: input.payload.destination.number,
          destination_complement: input.payload.destination.complement,
          notes: input.payload.notes,
          distance_m: input.quote.distance_m,
          duration_s: input.quote.duration_s,
          eta_min: input.quote.eta_min,
          zone: input.quote.zone,
          base_zone_brl: input.quote.base_zone_brl,
          urgency_brl: input.quote.urgency_brl,
          sunday_brl: input.quote.sunday_brl,
          holiday_brl: input.quote.holiday_brl,
          rain_brl: input.quote.rain_brl,
          peak_brl: input.quote.peak_brl,
          total_brl: input.quote.total_brl,
          confirmation_code_required: true,
          confirmation_code_status: "not_generated",
          payment_status: "pending",
          payment_required: true,
          payment_confirmed_at: null,
          created_at: now,
          updated_at: now,
        },
      });

      await tx.order_events.create({
        data: {
          order_id: createdOrder.id,
          event_type: "order_created",
          actor_user_id: input.commerceUserId,
          actor_role: "commerce",
          note: "Pedido criado pelo comerciante e aguardando pagamento.",
          payload: {
            status: "created",
            quote_id: input.quote.id,
          },
          occurred_at: now,
        },
      });

      return createdOrder;
    });
  }

  public async cancelOrderByCommerce(input: CancelOrderInput): Promise<orders | null> {
    const now = new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const order = await tx.orders.findFirst({
        where: {
          id: input.orderId,
          commerce_user_id: input.commerceUserId,
        },
      });

      if (!order) {
        return null;
      }

      const cancelReason = input.details
        ? `${input.reason} | ${input.details}`
        : input.reason;

      const canceledOrder = await tx.orders.update({
        where: {
          id: order.id,
        },
        data: {
          status: "canceled",
          canceled_at: now,
          cancel_reason: cancelReason,
          updated_at: now,
        },
      });

      if (!order.payment_required && order.total_brl) {
        const wallet = await tx.credits_wallets.findUnique({
          where: {
            commerce_user_id: input.commerceUserId,
          },
        });

        if (wallet) {
          const releasableAmount = wallet.reserved_brl.lt(order.total_brl)
            ? wallet.reserved_brl
            : order.total_brl;

          if (releasableAmount.gt(0)) {
            const updatedWallet = await tx.credits_wallets.update({
              where: {
                commerce_user_id: input.commerceUserId,
              },
              data: {
                balance_brl: {
                  increment: releasableAmount,
                },
                reserved_brl: {
                  decrement: releasableAmount,
                },
                updated_at: now,
              },
            });

            await tx.credits_ledger.create({
              data: {
                commerce_user_id: input.commerceUserId,
                order_id: order.id,
                entry_type: "release",
                amount_brl: releasableAmount,
                balance_after_brl: updatedWallet.balance_brl,
                reference_type: "order",
                reference_id: order.id,
                reason: "Liberacao de creditos por cancelamento do pedido.",
                created_by_user_id: input.commerceUserId,
                created_at: now,
              },
            });
          }
        }
      }

      await tx.order_events.create({
        data: {
          order_id: order.id,
          event_type: "canceled",
          actor_user_id: input.commerceUserId,
          actor_role: "commerce",
          note: cancelReason,
          payload: {
            status: "canceled",
          },
          occurred_at: now,
        },
      });

      return canceledOrder;
    });
  }
}
