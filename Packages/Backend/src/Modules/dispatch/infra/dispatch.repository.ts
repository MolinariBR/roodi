import type {
  Prisma,
  PrismaClient,
  dispatch_offers,
  order_status,
  orders,
} from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";

type DispatchOrderRecord = dispatch_offers & {
  orders: orders;
};

type GetCurrentOfferResult = DispatchOrderRecord | null;

const DEFAULT_OFFER_SECONDS = 120;
const DEFAULT_TOP_LIMIT = 3;

export class DispatchRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public async createInitialDispatchForOrder(input: {
    orderId: string;
    zoneLabel?: string;
    topLimit?: number;
    offerSeconds?: number;
  }): Promise<void> {
    const now = new Date();
    const topLimit = input.topLimit ?? DEFAULT_TOP_LIMIT;
    const offerSeconds = input.offerSeconds ?? DEFAULT_OFFER_SECONDS;

    await this.prismaClient.$transaction(async (tx) => {
      const maxBatch = await tx.dispatch_batches.aggregate({
        where: {
          order_id: input.orderId,
        },
        _max: {
          batch_number: true,
        },
      });
      const batchNumber = (maxBatch._max.batch_number ?? 0) + 1;

      const createdBatch = await tx.dispatch_batches.create({
        data: {
          order_id: input.orderId,
          zone_label: input.zoneLabel,
          batch_number: batchNumber,
          top_limit: topLimit,
          opened_at: now,
        },
      });

      const onlineRiders = await tx.rider_profiles.findMany({
        where: {
          is_online: true,
          users: {
            role: "rider",
            status: "active",
          },
        },
        select: {
          user_id: true,
        },
        orderBy: [
          {
            updated_at: "asc",
          },
        ],
        take: topLimit,
      });

      if (onlineRiders.length === 0) {
        return;
      }

      await tx.dispatch_offers.createMany({
        data: onlineRiders.map((rider, index): Prisma.dispatch_offersCreateManyInput => ({
          batch_id: createdBatch.id,
          order_id: input.orderId,
          rider_user_id: rider.user_id,
          position_in_queue: index + 1,
          offered_at: now,
          expires_at: new Date(now.getTime() + offerSeconds * 1000),
          decision: "pending",
        })),
      });

      await tx.orders.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: "rider_assigned",
          updated_at: now,
        },
      });

      await tx.order_events.create({
        data: {
          order_id: input.orderId,
          event_type: "rider_assigned",
          actor_role: "admin",
          note: "Dispatch inicial aberto e riders notificados.",
          payload: {
            status: "rider_assigned",
            batch_number: batchNumber,
          },
          occurred_at: now,
        },
      });
    });
  }

  public async getCurrentOfferForRider(riderUserId: string): Promise<GetCurrentOfferResult> {
    const now = new Date();

    await this.prismaClient.dispatch_offers.updateMany({
      where: {
        rider_user_id: riderUserId,
        decision: "pending",
        expires_at: {
          lte: now,
        },
      },
      data: {
        decision: "expired",
        decided_at: now,
      },
    });

    return this.prismaClient.dispatch_offers.findFirst({
      where: {
        rider_user_id: riderUserId,
        decision: "pending",
        expires_at: {
          gt: now,
        },
        orders: {
          status: {
            in: ["searching_rider", "rider_assigned"] as order_status[],
          },
        },
      },
      include: {
        orders: true,
      },
      orderBy: {
        offered_at: "desc",
      },
    });
  }

  public async acceptOffer(input: { offerId: string; riderUserId: string }): Promise<orders | null> {
    const now = new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const currentOffer = await tx.dispatch_offers.findFirst({
        where: {
          id: input.offerId,
          rider_user_id: input.riderUserId,
        },
        include: {
          orders: true,
        },
      });

      if (!currentOffer) {
        return null;
      }

      if (currentOffer.decision !== "pending") {
        throw new Error("OFFER_UNAVAILABLE");
      }

      if (currentOffer.expires_at.getTime() <= now.getTime()) {
        await tx.dispatch_offers.update({
          where: {
            id: currentOffer.id,
          },
          data: {
            decision: "expired",
            decided_at: now,
          },
        });
        throw new Error("OFFER_EXPIRED");
      }

      if (currentOffer.orders.status === "canceled" || currentOffer.orders.status === "completed") {
        throw new Error("INVALID_ORDER_STATE");
      }

      await tx.dispatch_offers.update({
        where: {
          id: currentOffer.id,
        },
        data: {
          decision: "accepted",
          decided_at: now,
        },
      });

      await tx.dispatch_offers.updateMany({
        where: {
          order_id: currentOffer.order_id,
          id: {
            not: currentOffer.id,
          },
          decision: "pending",
        },
        data: {
          decision: "no_response",
          decided_at: now,
        },
      });

      await tx.dispatch_batches.update({
        where: {
          id: currentOffer.batch_id,
        },
        data: {
          winner_offer_id: currentOffer.id,
          closed_at: now,
        },
      });

      const updatedOrder = await tx.orders.update({
        where: {
          id: currentOffer.order_id,
        },
        data: {
          rider_user_id: input.riderUserId,
          status: "to_merchant",
          accepted_at: now,
          updated_at: now,
        },
      });

      await tx.order_events.create({
        data: {
          order_id: currentOffer.order_id,
          event_type: "rider_accepted",
          actor_user_id: input.riderUserId,
          actor_role: "rider",
          note: "Rider aceitou a oferta.",
          payload: {
            status: "to_merchant",
            offer_id: currentOffer.id,
          },
          occurred_at: now,
        },
      });

      return updatedOrder;
    });
  }

  public async rejectOffer(input: {
    offerId: string;
    riderUserId: string;
    reason?: string;
  }): Promise<boolean> {
    const now = new Date();

    const offer = await this.prismaClient.dispatch_offers.findFirst({
      where: {
        id: input.offerId,
        rider_user_id: input.riderUserId,
      },
      select: {
        id: true,
        decision: true,
      },
    });

    if (!offer) {
      return false;
    }

    if (offer.decision !== "pending") {
      throw new Error("OFFER_UNAVAILABLE");
    }

    await this.prismaClient.dispatch_offers.update({
      where: {
        id: offer.id,
      },
      data: {
        decision: "rejected",
        decision_reason: input.reason,
        decided_at: now,
      },
    });

    return true;
  }
}
