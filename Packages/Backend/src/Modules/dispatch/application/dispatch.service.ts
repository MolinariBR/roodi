import { AppError } from "@core/http/errors/app-error";
import { toOrderPayload } from "@modules/orders/domain/order.mapper";
import { DispatchRepository } from "@modules/dispatch/infra/dispatch.repository";

const toMoney = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export class DispatchService {
  constructor(private readonly dispatchRepository = new DispatchRepository()) {}

  public async openInitialDispatch(orderId: string, zone: number | null): Promise<void> {
    await this.dispatchRepository.createInitialDispatchForOrder({
      orderId,
      zoneLabel: zone !== null ? `Zona ${zone}` : undefined,
    });
  }

  public async getCurrentOffer(riderUserId: string): Promise<Record<string, unknown> | null> {
    const offer = await this.dispatchRepository.getCurrentOfferForRider(riderUserId);
    if (!offer) {
      return null;
    }

    return {
      offer_id: offer.id,
      order_id: offer.order_id,
      expires_at: offer.expires_at.toISOString(),
      quote: {
        pickup_type: "Pedido",
        estimated_value_brl: toMoney(offer.orders.total_brl),
        total_distance_m: offer.orders.distance_m ?? 0,
        route_summary:
          offer.orders.destination_neighborhood ??
          offer.orders.destination_city ??
          "Rota de entrega",
      },
    };
  }

  public async acceptOffer(input: {
    offerId: string;
    riderUserId: string;
  }): Promise<Record<string, unknown>> {
    try {
      const updatedOrder = await this.dispatchRepository.acceptOffer(input);

      if (!updatedOrder) {
        throw new AppError({
          code: "NOT_FOUND",
          message: "Offer not found.",
          statusCode: 404,
        });
      }

      return toOrderPayload(updatedOrder);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.message.startsWith("OFFER_")) {
        throw new AppError({
          code: "CONFLICT",
          message: "Offer is no longer available.",
          statusCode: 409,
        });
      }

      if (error instanceof Error && error.message === "INVALID_ORDER_STATE") {
        throw new AppError({
          code: "CONFLICT",
          message: "Order state does not allow accepting this offer.",
          statusCode: 409,
        });
      }

      throw error;
    }
  }

  public async rejectOffer(input: {
    offerId: string;
    riderUserId: string;
    reason?: string;
  }): Promise<void> {
    try {
      const found = await this.dispatchRepository.rejectOffer(input);
      if (!found) {
        throw new AppError({
          code: "NOT_FOUND",
          message: "Offer not found.",
          statusCode: 404,
        });
      }
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.message === "OFFER_UNAVAILABLE") {
        throw new AppError({
          code: "CONFLICT",
          message: "Offer is no longer available.",
          statusCode: 409,
        });
      }

      throw error;
    }
  }
}
