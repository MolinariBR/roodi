import { createHash, randomInt } from "node:crypto";

import type { PrismaClient, order_events, orders, tracking_event_type } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";

const ORDER_CONFIRMATION_CODE_LENGTH = 4;
const ORDER_CONFIRMATION_EXPIRES_HOURS = 12;
const CODE_HASH_ALGORITHM = "sha256";
const BASE10_RADIX = 10;

const buildConfirmationCode = (): string => {
  const min = 10 ** (ORDER_CONFIRMATION_CODE_LENGTH - 1);
  const max = 10 ** ORDER_CONFIRMATION_CODE_LENGTH;
  return randomInt(min, max).toString(BASE10_RADIX);
};

const hashConfirmationCode = (code: string): string => {
  return createHash(CODE_HASH_ALGORITHM).update(code).digest("hex");
};

type AppendedOrderEvent = {
  order: orders;
  event: order_events;
};

type ConfirmationCodeValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason: "not_found" | "expired" | "max_attempts" | "invalid";
    };

export class TrackingRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findOrderById(orderId: string): Promise<orders | null> {
    return this.prismaClient.orders.findUnique({
      where: {
        id: orderId,
      },
    });
  }

  public findCommerceOrder(orderId: string, commerceUserId: string): Promise<orders | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        id: orderId,
        commerce_user_id: commerceUserId,
      },
    });
  }

  public findRiderOrder(orderId: string, riderUserId: string): Promise<orders | null> {
    return this.prismaClient.orders.findFirst({
      where: {
        id: orderId,
        rider_user_id: riderUserId,
      },
    });
  }

  public listOrderEvents(orderId: string): Promise<order_events[]> {
    return this.prismaClient.order_events.findMany({
      where: {
        order_id: orderId,
      },
      orderBy: {
        occurred_at: "asc",
      },
    });
  }

  public async getOrCreateConfirmationCode(input: {
    orderId: string;
  }): Promise<{ code: string; generatedAt: Date; expiresAt: Date }> {
    const now = new Date();
    const existingCode = await this.prismaClient.order_confirmation_codes.findUnique({
      where: {
        order_id: input.orderId,
      },
      select: {
        code_last4: true,
        generated_at: true,
        expires_at: true,
      },
    });

    if (existingCode?.code_last4) {
      return {
        code: existingCode.code_last4,
        generatedAt: existingCode.generated_at,
        expiresAt: existingCode.expires_at,
      };
    }

    const confirmationCode = buildConfirmationCode();
    const expiresAt = new Date(now.getTime() + ORDER_CONFIRMATION_EXPIRES_HOURS * 60 * 60 * 1000);

    const savedCode = await this.prismaClient.$transaction(async (tx) => {
      const saved = await tx.order_confirmation_codes.upsert({
        where: {
          order_id: input.orderId,
        },
        create: {
          order_id: input.orderId,
          code_hash: hashConfirmationCode(confirmationCode),
          code_last4: confirmationCode,
          generated_at: now,
          expires_at: expiresAt,
          max_attempts: 5,
        },
        update: {
          code_hash: hashConfirmationCode(confirmationCode),
          code_last4: confirmationCode,
          generated_at: now,
          expires_at: expiresAt,
          attempts_count: 0,
          validated_at: null,
          validated_by_rider_user_id: null,
        },
        select: {
          code_last4: true,
          generated_at: true,
          expires_at: true,
        },
      });

      await tx.orders.update({
        where: {
          id: input.orderId,
        },
        data: {
          confirmation_code_status: "generated",
          updated_at: now,
        },
      });

      return saved;
    });

    return {
      code: savedCode.code_last4 ?? confirmationCode,
      generatedAt: savedCode.generated_at,
      expiresAt: savedCode.expires_at,
    };
  }

  public async appendOrderEventAndUpdateStatus(input: {
    orderId: string;
    riderUserId: string;
    eventType: tracking_event_type;
    note?: string;
    occurredAt: Date;
    nextStatus: orders["status"];
  }): Promise<AppendedOrderEvent | null> {
    return this.prismaClient.$transaction(async (tx) => {
      const currentOrder = await tx.orders.findFirst({
        where: {
          id: input.orderId,
          rider_user_id: input.riderUserId,
        },
      });

      if (!currentOrder) {
        return null;
      }

      const now = new Date();
      const updatedOrder = await tx.orders.update({
        where: {
          id: currentOrder.id,
        },
        data: {
          status: input.nextStatus,
          ...(input.nextStatus === "completed"
            ? { completed_at: input.occurredAt }
            : {}),
          ...(input.nextStatus === "canceled"
            ? { canceled_at: input.occurredAt, cancel_reason: input.note ?? "Canceled by rider" }
            : {}),
          updated_at: now,
        },
      });

      const createdEvent = await tx.order_events.create({
        data: {
          order_id: input.orderId,
          event_type: input.eventType,
          actor_user_id: input.riderUserId,
          actor_role: "rider",
          note: input.note,
          payload: {
            status: input.nextStatus,
          },
          occurred_at: input.occurredAt,
        },
      });

      return {
        order: updatedOrder,
        event: createdEvent,
      };
    });
  }

  public async validateConfirmationCode(input: {
    orderId: string;
    riderUserId: string;
    confirmationCode: string;
  }): Promise<ConfirmationCodeValidationResult> {
    const now = new Date();
    const expectedCodeHash = hashConfirmationCode(input.confirmationCode);

    return this.prismaClient.$transaction(async (tx) => {
      const currentCode = await tx.order_confirmation_codes.findUnique({
        where: {
          order_id: input.orderId,
        },
      });

      if (!currentCode) {
        return { valid: false, reason: "not_found" };
      }

      if (currentCode.expires_at.getTime() <= now.getTime()) {
        return { valid: false, reason: "expired" };
      }

      if (currentCode.attempts_count >= currentCode.max_attempts) {
        return { valid: false, reason: "max_attempts" };
      }

      if (currentCode.code_hash !== expectedCodeHash) {
        await tx.order_confirmation_codes.update({
          where: {
            order_id: input.orderId,
          },
          data: {
            attempts_count: {
              increment: 1,
            },
          },
        });

        return { valid: false, reason: "invalid" };
      }

      await tx.order_confirmation_codes.update({
        where: {
          order_id: input.orderId,
        },
        data: {
          validated_at: now,
          validated_by_rider_user_id: input.riderUserId,
        },
      });

      await tx.orders.update({
        where: {
          id: input.orderId,
        },
        data: {
          confirmation_code_status: "validated",
          updated_at: now,
        },
      });

      return { valid: true };
    });
  }
}
