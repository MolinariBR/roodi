import type { Prisma, PrismaClient, system_flags, system_runtime_state } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { SystemMaintenanceUpdateRequest } from "@modules/system/domain/system.schemas";

const SYSTEM_RUNTIME_SINGLETON_ID = 1;

type UpdateFlagInput = {
  flagKey: string;
  enabled: boolean;
  updatedByUserId: string;
};

type SetMaintenanceInput = {
  payload: SystemMaintenanceUpdateRequest;
  updatedByUserId: string;
};

const decimalToNumber = (value: Prisma.Decimal | number | string | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const converted = Number(value);
  return Number.isFinite(converted) ? converted : 0;
};

export class SystemRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findRuntimeState(): Promise<system_runtime_state | null> {
    return this.prismaClient.system_runtime_state.findUnique({
      where: {
        singleton_id: SYSTEM_RUNTIME_SINGLETON_ID,
      },
    });
  }

  public listFlags(): Promise<system_flags[]> {
    return this.prismaClient.system_flags.findMany({
      orderBy: {
        flag_key: "asc",
      },
    });
  }

  public async updateFlag(input: UpdateFlagInput): Promise<system_flags | null> {
    const now = new Date();
    const updateResult = await this.prismaClient.system_flags.updateMany({
      where: {
        flag_key: input.flagKey,
      },
      data: {
        enabled: input.enabled,
        updated_by_user_id: input.updatedByUserId,
        updated_at: now,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.prismaClient.system_flags.findUnique({
      where: {
        flag_key: input.flagKey,
      },
    });
  }

  public setMaintenanceState({
    payload,
    updatedByUserId,
  }: SetMaintenanceInput): Promise<system_runtime_state> {
    const now = new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const runtimeState = await tx.system_runtime_state.upsert({
        where: {
          singleton_id: SYSTEM_RUNTIME_SINGLETON_ID,
        },
        update: {
          maintenance_enabled: payload.enabled,
          maintenance_message: payload.message,
          expected_back_at: payload.expected_back_at ?? null,
          updated_by_user_id: updatedByUserId,
          updated_at: now,
        },
        create: {
          singleton_id: SYSTEM_RUNTIME_SINGLETON_ID,
          maintenance_enabled: payload.enabled,
          maintenance_message: payload.message,
          expected_back_at: payload.expected_back_at ?? null,
          min_supported_app_version: null,
          force_update_enabled: false,
          updated_by_user_id: updatedByUserId,
          updated_at: now,
        },
      });

      await tx.system_runtime_history.create({
        data: {
          maintenance_enabled: runtimeState.maintenance_enabled,
          maintenance_message: runtimeState.maintenance_message,
          expected_back_at: runtimeState.expected_back_at,
          min_supported_app_version: runtimeState.min_supported_app_version,
          force_update_enabled: runtimeState.force_update_enabled,
          updated_by_user_id: runtimeState.updated_by_user_id,
          created_at: now,
        },
      });

      return runtimeState;
    });
  }

  public async getAdminDashboardKpis(): Promise<{
    active_orders: number;
    completed_today: number;
    canceled_today: number;
    gross_volume_brl: number;
    platform_commission_brl: number;
  }> {
    const now = new Date();
    const startOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDayUtc = new Date(startOfDayUtc.getTime() + 24 * 60 * 60 * 1000);

    const [activeOrders, completedToday, canceledToday, completedAggregate, commissionAggregate] =
      await this.prismaClient.$transaction([
        this.prismaClient.orders.count({
          where: {
            status: {
              notIn: ["completed", "canceled"],
            },
          },
        }),
        this.prismaClient.orders.count({
          where: {
            status: "completed",
            completed_at: {
              gte: startOfDayUtc,
              lt: endOfDayUtc,
            },
          },
        }),
        this.prismaClient.orders.count({
          where: {
            status: "canceled",
            canceled_at: {
              gte: startOfDayUtc,
              lt: endOfDayUtc,
            },
          },
        }),
        this.prismaClient.orders.aggregate({
          where: {
            status: "completed",
            completed_at: {
              gte: startOfDayUtc,
              lt: endOfDayUtc,
            },
          },
          _sum: {
            total_brl: true,
          },
        }),
        this.prismaClient.order_financials.aggregate({
          where: {
            orders: {
              status: "completed",
              completed_at: {
                gte: startOfDayUtc,
                lt: endOfDayUtc,
              },
            },
          },
          _sum: {
            platform_commission_brl: true,
          },
        }),
      ]);

    return {
      active_orders: activeOrders,
      completed_today: completedToday,
      canceled_today: canceledToday,
      gross_volume_brl: decimalToNumber(completedAggregate._sum.total_brl),
      platform_commission_brl: decimalToNumber(commissionAggregate._sum.platform_commission_brl),
    };
  }
}
