import type { system_flags, system_runtime_state } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import { env } from "@core/config/env";
import { logger } from "@core/observability/logger";
import type {
  SystemFlagUpdateRequest,
  SystemMaintenanceUpdateRequest,
} from "@modules/system/domain/system.schemas";
import { SystemRepository } from "@modules/system/infra/system.repository";

type SystemStatus = "ok" | "degraded" | "maintenance";

const DEGRADED_FLAG_KEYS = new Set(["allow_new_orders", "allow_dispatch", "allow_payments"]);

export class SystemService {
  constructor(private readonly systemRepository = new SystemRepository()) {}

  private resolveStatus(
    runtimeState: system_runtime_state,
    flags: system_flags[],
  ): SystemStatus {
    if (runtimeState.maintenance_enabled) {
      return "maintenance";
    }

    const hasCriticalFlagDisabled = flags.some(
      (flag) => DEGRADED_FLAG_KEYS.has(flag.flag_key) && !flag.enabled,
    );

    if (runtimeState.force_update_enabled || hasCriticalFlagDisabled) {
      return "degraded";
    }

    return "ok";
  }

  public async getStatus(): Promise<{
    success: true;
    data: {
      status: SystemStatus;
      maintenance_mode: boolean;
      maintenance_message?: string;
      app_version: string;
      api_version: string;
      timestamp: string;
    };
  }> {
    try {
      const [runtimeState, flags] = await Promise.all([
        this.systemRepository.findRuntimeState(),
        this.systemRepository.listFlags(),
      ]);

      if (!runtimeState) {
        throw new AppError({
          code: "SERVICE_UNAVAILABLE",
          message: "System runtime state is not initialized.",
          statusCode: 503,
        });
      }

      return {
        success: true,
        data: {
          status: this.resolveStatus(runtimeState, flags),
          maintenance_mode: runtimeState.maintenance_enabled,
          ...(runtimeState.maintenance_message
            ? { maintenance_message: runtimeState.maintenance_message }
            : {}),
          app_version: env.appVersion,
          api_version: env.apiVersion,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ error }, "system_status_read_failed");
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "System status is currently unavailable.",
        statusCode: 503,
      });
    }
  }

  public async listSystemFlags(): Promise<{
    success: true;
    data: { key: string; enabled: boolean; description?: string }[];
  }> {
    const flags = await this.systemRepository.listFlags();

    return {
      success: true,
      data: flags.map((flag) => ({
        key: flag.flag_key,
        enabled: flag.enabled,
        ...(flag.description ? { description: flag.description } : {}),
      })),
    };
  }

  public async updateSystemFlag(input: {
    flagKey: string;
    payload: SystemFlagUpdateRequest;
    updatedByUserId: string;
  }): Promise<{ key: string; enabled: boolean; description?: string }> {
    const updatedFlag = await this.systemRepository.updateFlag({
      flagKey: input.flagKey,
      enabled: input.payload.enabled,
      updatedByUserId: input.updatedByUserId,
    });

    if (!updatedFlag) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "System flag not found.",
        statusCode: 404,
      });
    }

    return {
      key: updatedFlag.flag_key,
      enabled: updatedFlag.enabled,
      ...(updatedFlag.description ? { description: updatedFlag.description } : {}),
    };
  }

  public async getMaintenanceStatus(): Promise<{
    enabled: boolean;
    message: string;
    expected_back_at?: string;
    updated_at: string;
  }> {
    const runtimeState = await this.systemRepository.findRuntimeState();
    if (!runtimeState) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "System runtime state is not initialized.",
        statusCode: 503,
      });
    }

    return {
      enabled: runtimeState.maintenance_enabled,
      message: runtimeState.maintenance_message ?? "",
      ...(runtimeState.expected_back_at
        ? { expected_back_at: runtimeState.expected_back_at.toISOString() }
        : {}),
      updated_at: runtimeState.updated_at.toISOString(),
    };
  }

  public async setMaintenanceStatus(input: {
    payload: SystemMaintenanceUpdateRequest;
    updatedByUserId: string;
  }): Promise<{
    enabled: boolean;
    message: string;
    expected_back_at?: string;
    updated_at: string;
  }> {
    const runtimeState = await this.systemRepository.setMaintenanceState({
      payload: input.payload,
      updatedByUserId: input.updatedByUserId,
    });

    return {
      enabled: runtimeState.maintenance_enabled,
      message: runtimeState.maintenance_message ?? "",
      ...(runtimeState.expected_back_at
        ? { expected_back_at: runtimeState.expected_back_at.toISOString() }
        : {}),
      updated_at: runtimeState.updated_at.toISOString(),
    };
  }

  public async getAdminDashboard(): Promise<{
    success: true;
    data: {
      active_orders: number;
      completed_today: number;
      canceled_today: number;
      gross_volume_brl: number;
      platform_commission_brl: number;
    };
  }> {
    const responseBody = await this.systemRepository.getAdminDashboardKpis();

    return {
      success: true,
      data: responseBody,
    };
  }
}
