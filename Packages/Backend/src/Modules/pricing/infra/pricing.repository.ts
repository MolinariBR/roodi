import type {
  Prisma,
  PrismaClient,
  pricing_holidays,
  users,
} from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { PricingRulesUpdateRequest } from "@modules/pricing/domain/admin.schemas";

const ACTIVE_RULE_INCLUDE = {
  pricing_zone_rules: {
    orderBy: {
      zone: "asc",
    },
  },
  pricing_urgency_rules: true,
  pricing_conditional_rules: true,
  pricing_peak_windows: true,
} satisfies Prisma.pricing_rule_versionsInclude;

export type ActivePricingRule = Prisma.pricing_rule_versionsGetPayload<{
  include: typeof ACTIVE_RULE_INCLUDE;
}>;

const toDecimalString = (value: number, digits = 2): string => {
  const converted = Number(value);
  if (!Number.isFinite(converted)) {
    return "0.00";
  }

  return converted.toFixed(digits);
};

const buildVersionCode = (now: Date): string => {
  const compact = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `PRC-${compact}`;
};

export class PricingRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findActiveRule(requestedAtIso: Date): Promise<ActivePricingRule | null> {
    return this.prismaClient.pricing_rule_versions.findFirst({
      where: {
        is_active: true,
        effective_from: {
          lte: requestedAtIso,
        },
        OR: [
          { effective_to: null },
          {
            effective_to: {
              gt: requestedAtIso,
            },
          },
        ],
      },
      include: ACTIVE_RULE_INCLUDE,
      orderBy: {
        effective_from: "desc",
      },
    });
  }

  public findHolidayByDate(holidayDateUtc: Date): Promise<pricing_holidays | null> {
    return this.prismaClient.pricing_holidays.findFirst({
      where: {
        holiday_date: holidayDateUtc,
        is_active: true,
      },
    });
  }

  public findCommerceUserById(userId: string): Promise<users | null> {
    return this.prismaClient.users.findFirst({
      where: {
        id: userId,
        role: "commerce",
        status: "active",
      },
    });
  }

  public async replaceActiveRule(input: {
    payload: PricingRulesUpdateRequest;
    createdByUserId: string;
  }): Promise<ActivePricingRule> {
    const now = new Date();

    const createdRuleId = await this.prismaClient.$transaction(async (tx) => {
      const previousActive = await tx.pricing_rule_versions.findFirst({
        where: {
          is_active: true,
        },
        include: {
          pricing_peak_windows: true,
        },
        orderBy: {
          effective_from: "desc",
        },
      });

      await tx.pricing_rule_versions.updateMany({
        where: {
          is_active: true,
        },
        data: {
          is_active: false,
        },
      });

      const createdRule = await tx.pricing_rule_versions.create({
        data: {
          version_code: buildVersionCode(now),
          is_active: true,
          effective_from: now,
          effective_to: null,
          minimum_charge_brl: toDecimalString(input.payload.minimum_charge_brl, 2),
          max_distance_km: toDecimalString(input.payload.max_distance_km, 2),
          notes: "Updated via admin API.",
          created_by_user_id: input.createdByUserId,
          created_at: now,
        },
        select: {
          id: true,
        },
      });

      await tx.pricing_urgency_rules.createMany({
        data: [
          {
            rule_version_id: createdRule.id,
            urgency: "padrao",
            addon_brl: toDecimalString(input.payload.urgency_addon_brl.padrao, 2),
          },
          {
            rule_version_id: createdRule.id,
            urgency: "urgente",
            addon_brl: toDecimalString(input.payload.urgency_addon_brl.urgente, 2),
          },
          {
            rule_version_id: createdRule.id,
            urgency: "agendado",
            addon_brl: toDecimalString(input.payload.urgency_addon_brl.agendado, 2),
          },
        ],
      });

      await tx.pricing_conditional_rules.createMany({
        data: [
          {
            rule_version_id: createdRule.id,
            condition_key: "sunday",
            addon_brl: toDecimalString(input.payload.conditional_addons_brl.sunday, 2),
          },
          {
            rule_version_id: createdRule.id,
            condition_key: "holiday",
            addon_brl: toDecimalString(input.payload.conditional_addons_brl.holiday, 2),
          },
          {
            rule_version_id: createdRule.id,
            condition_key: "rain",
            addon_brl: toDecimalString(input.payload.conditional_addons_brl.rain, 2),
          },
          {
            rule_version_id: createdRule.id,
            condition_key: "peak",
            addon_brl: toDecimalString(input.payload.conditional_addons_brl.peak, 2),
          },
        ],
      });

      await tx.pricing_zone_rules.createMany({
        data: input.payload.distance_zones_brl.map((zoneRule) => ({
          rule_version_id: createdRule.id,
          zone: zoneRule.zone,
          min_km: toDecimalString(zoneRule.min_km, 2),
          max_km: toDecimalString(zoneRule.max_km, 2),
          base_value_brl: toDecimalString(zoneRule.value_brl, 2),
        })),
      });

      if (previousActive?.pricing_peak_windows?.length) {
        await tx.pricing_peak_windows.createMany({
          data: previousActive.pricing_peak_windows.map((window) => ({
            rule_version_id: createdRule.id,
            start_hour: window.start_hour,
            end_hour: window.end_hour,
          })),
        });
      }

      return createdRule.id;
    });

    const createdRule = await this.prismaClient.pricing_rule_versions.findUnique({
      where: {
        id: createdRuleId,
      },
      include: ACTIVE_RULE_INCLUDE,
    });

    if (!createdRule) {
      throw new Error("PRICING_RULE_NOT_FOUND_AFTER_UPDATE");
    }

    return createdRule;
  }
}
