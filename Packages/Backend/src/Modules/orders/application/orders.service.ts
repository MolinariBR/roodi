import type { order_status } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import { toOrderPayload } from "@modules/orders/domain/order.mapper";
import { RIDER_ACTIVE_ORDER_STATUSES } from "@modules/orders/domain/order.state-machine";
import type {
  CancelOrderRequest,
  CreateOrderRequest,
  OrderListQuery,
} from "@modules/orders/domain/orders.schemas";
import { OrdersRepository } from "@modules/orders/infra/orders.repository";

const assertCancelableOrderStatus = (status: order_status): void => {
  if (status === "completed" || status === "canceled") {
    throw new AppError({
      code: "CONFLICT",
      message: "Order cannot be canceled in current state.",
      statusCode: 409,
    });
  }
};

export class OrdersService {
  constructor(private readonly ordersRepository = new OrdersRepository()) {}

  public async listAdminOrders(input: {
    query: OrderListQuery;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { items, total } = await this.ordersRepository.listAdminOrders(input.query);

    return {
      success: true,
      data: items.map((order) => toOrderPayload(order)),
      pagination: {
        page: input.query.page,
        limit: input.query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / input.query.limit) : 0,
      },
    };
  }

  public async getAdminOrder(orderId: string): Promise<Record<string, unknown>> {
    const order = await this.ordersRepository.findOrderById(orderId);
    if (!order) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    return toOrderPayload(order);
  }

  public async listCommerceOrders(input: {
    commerceUserId: string;
    query: OrderListQuery;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { items, total } = await this.ordersRepository.listCommerceOrders({
      userId: input.commerceUserId,
      query: input.query,
    });

    return {
      success: true,
      data: items.map((order) => toOrderPayload(order)),
      pagination: {
        page: input.query.page,
        limit: input.query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / input.query.limit) : 0,
      },
    };
  }

  public async createCommerceOrder(input: {
    commerceUserId: string;
    payload: CreateOrderRequest;
  }): Promise<Record<string, unknown>> {
    const quote = await this.ordersRepository.findQuoteByIdForCommerce(
      input.payload.quote_id,
      input.commerceUserId,
    );

    if (!quote) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Quote not found.",
        statusCode: 404,
      });
    }

    if (quote.urgency !== input.payload.urgency) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Urgency must match quote urgency.",
        statusCode: 400,
      });
    }

    if (!quote.total_brl || Number(quote.total_brl) <= 0) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Quote must have valid total amount.",
        statusCode: 400,
      });
    }

    const createdOrder = await this.ordersRepository.createOrderAwaitingPayment({
      commerceUserId: input.commerceUserId,
      payload: input.payload,
      quote,
    });

    return toOrderPayload(createdOrder);
  }

  public async getCommerceOrder(input: {
    commerceUserId: string;
    orderId: string;
  }): Promise<Record<string, unknown>> {
    const order = await this.ordersRepository.findCommerceOrderById(
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

    return toOrderPayload(order);
  }

  public async cancelCommerceOrder(input: {
    commerceUserId: string;
    orderId: string;
    payload: CancelOrderRequest;
  }): Promise<Record<string, unknown>> {
    const existingOrder = await this.ordersRepository.findCommerceOrderById(
      input.orderId,
      input.commerceUserId,
    );

    if (!existingOrder) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    assertCancelableOrderStatus(existingOrder.status);

    const canceledOrder = await this.ordersRepository.cancelOrderByCommerce({
      orderId: input.orderId,
      commerceUserId: input.commerceUserId,
      reason: input.payload.reason,
      details: input.payload.details,
    });

    if (!canceledOrder) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    return toOrderPayload(canceledOrder);
  }

  public async getRiderActiveOrder(riderUserId: string): Promise<Record<string, unknown> | null> {
    const activeOrder = await this.ordersRepository.findRiderActiveOrder(
      riderUserId,
      RIDER_ACTIVE_ORDER_STATUSES,
    );

    if (!activeOrder) {
      return null;
    }

    return toOrderPayload(activeOrder);
  }

  public async listRiderOrderHistory(input: {
    riderUserId: string;
    query: OrderListQuery;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { items, total } = await this.ordersRepository.listRiderOrderHistory({
      userId: input.riderUserId,
      query: input.query,
    });

    return {
      success: true,
      data: items.map((order) => toOrderPayload(order)),
      pagination: {
        page: input.query.page,
        limit: input.query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / input.query.limit) : 0,
      },
    };
  }

  public async getRiderOrder(input: {
    riderUserId: string;
    orderId: string;
  }): Promise<Record<string, unknown>> {
    const order = await this.ordersRepository.findRiderOrderById(
      input.orderId,
      input.riderUserId,
    );

    if (!order) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    return toOrderPayload(order);
  }
}
