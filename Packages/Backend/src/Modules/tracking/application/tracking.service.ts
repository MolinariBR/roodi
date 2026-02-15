import type { order_status, tracking_event_type } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import { isOrderStatusTransitionAllowed } from "@modules/orders/domain/order.state-machine";
import { toOrderPayload } from "@modules/orders/domain/order.mapper";
import { PaymentsService } from "@modules/payments/application/payments.service";
import { TrackingRepository } from "@modules/tracking/infra/tracking.repository";
import type { RiderOrderEventRequest } from "@modules/tracking/domain/tracking.schemas";

const EVENT_TO_STATUS: Partial<Record<tracking_event_type, order_status>> = {
  rider_to_merchant: "to_merchant",
  rider_at_merchant: "at_merchant",
  waiting_order: "waiting_order",
  rider_to_customer: "to_customer",
  rider_at_customer: "at_customer",
  finishing_delivery: "finishing_delivery",
  completed: "completed",
  canceled: "canceled",
};

const toEventPayload = (event: {
  id: string;
  order_id: string;
  event_type: tracking_event_type;
  occurred_at: Date;
  actor_role: "admin" | "commerce" | "rider" | null;
  note: string | null;
}): Record<string, unknown> => {
  return {
    id: event.id,
    order_id: event.order_id,
    event_type: event.event_type,
    occurred_at: event.occurred_at.toISOString(),
    ...(event.actor_role ? { actor_role: event.actor_role } : {}),
    ...(event.note ? { note: event.note } : {}),
  };
};

export class TrackingService {
  constructor(
    private readonly trackingRepository = new TrackingRepository(),
    private readonly paymentsService = new PaymentsService(),
  ) {}

  public async getAdminOrderTracking(input: {
    orderId: string;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
  }> {
    const order = await this.trackingRepository.findOrderById(input.orderId);

    if (!order) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    const events = await this.trackingRepository.listOrderEvents(order.id);
    return {
      success: true,
      data: events.map((event) =>
        toEventPayload({
          id: event.id,
          order_id: event.order_id,
          event_type: event.event_type,
          occurred_at: event.occurred_at,
          actor_role: event.actor_role,
          note: event.note,
        })),
    };
  }

  public async getCommerceOrderTracking(input: {
    commerceUserId: string;
    orderId: string;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
  }> {
    const order = await this.trackingRepository.findCommerceOrder(
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

    const events = await this.trackingRepository.listOrderEvents(order.id);
    return {
      success: true,
      data: events.map((event) =>
        toEventPayload({
          id: event.id,
          order_id: event.order_id,
          event_type: event.event_type,
          occurred_at: event.occurred_at,
          actor_role: event.actor_role,
          note: event.note,
        })),
    };
  }

  public async getOrderConfirmationCode(input: {
    commerceUserId: string;
    orderId: string;
  }): Promise<{
    success: true;
    data: {
      order_id: string;
      code: string;
      generated_at: string;
      expires_at: string;
    };
  }> {
    const order = await this.trackingRepository.findCommerceOrder(
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

    const confirmationCode = await this.trackingRepository.getOrCreateConfirmationCode({
      orderId: order.id,
    });

    return {
      success: true,
      data: {
        order_id: order.id,
        code: confirmationCode.code,
        generated_at: confirmationCode.generatedAt.toISOString(),
        expires_at: confirmationCode.expiresAt.toISOString(),
      },
    };
  }

  public async appendRiderOrderEvent(input: {
    riderUserId: string;
    orderId: string;
    payload: RiderOrderEventRequest;
  }): Promise<Record<string, unknown>> {
    const order = await this.trackingRepository.findRiderOrder(
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

    const nextStatus = EVENT_TO_STATUS[input.payload.event_type];
    if (!nextStatus) {
      throw new AppError({
        code: "TRANSITION_NOT_ALLOWED",
        message: "Event type is not allowed for rider state transition.",
        statusCode: 409,
      });
    }

    if (!isOrderStatusTransitionAllowed(order.status, nextStatus)) {
      throw new AppError({
        code: "TRANSITION_NOT_ALLOWED",
        message: `Invalid transition from ${order.status} to ${nextStatus}.`,
        statusCode: 409,
      });
    }

    const result = await this.trackingRepository.appendOrderEventAndUpdateStatus({
      orderId: input.orderId,
      riderUserId: input.riderUserId,
      eventType: input.payload.event_type,
      occurredAt: input.payload.occurred_at,
      note: input.payload.note,
      nextStatus,
    });

    if (!result) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    if (result.order.status === "completed") {
      await this.paymentsService.consolidateOrderFinancials(result.order.id);
    }

    return toEventPayload({
      id: result.event.id,
      order_id: result.event.order_id,
      event_type: result.event.event_type,
      occurred_at: result.event.occurred_at,
      actor_role: result.event.actor_role,
      note: result.event.note,
    });
  }

  public async completeRiderOrder(input: {
    riderUserId: string;
    orderId: string;
    confirmationCode: string;
  }): Promise<Record<string, unknown>> {
    const order = await this.trackingRepository.findRiderOrder(
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

    if (order.status === "completed") {
      return toOrderPayload(order);
    }

    if (!isOrderStatusTransitionAllowed(order.status, "completed")) {
      throw new AppError({
        code: "TRANSITION_NOT_ALLOWED",
        message: `Invalid transition from ${order.status} to completed.`,
        statusCode: 409,
      });
    }

    if (order.confirmation_code_required) {
      const validationResult = await this.trackingRepository.validateConfirmationCode({
        orderId: order.id,
        riderUserId: input.riderUserId,
        confirmationCode: input.confirmationCode,
      });

      if (!validationResult.valid) {
        throw new AppError({
          code: "BAD_REQUEST",
          message: "Invalid or expired confirmation code.",
          statusCode: 422,
        });
      }
    }

    const now = new Date();
    const result = await this.trackingRepository.appendOrderEventAndUpdateStatus({
      orderId: order.id,
      riderUserId: input.riderUserId,
      eventType: "completed",
      occurredAt: now,
      note: "Delivery completed with confirmation code.",
      nextStatus: "completed",
    });

    if (!result) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Order not found.",
        statusCode: 404,
      });
    }

    await this.paymentsService.consolidateOrderFinancials(result.order.id);
    return toOrderPayload(result.order);
  }
}
