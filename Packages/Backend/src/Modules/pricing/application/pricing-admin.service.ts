import type { Prisma } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type { PricingRulesUpdateRequest } from "@modules/pricing/domain/admin.schemas";
import { PricingRepository, type ActivePricingRule } from "@modules/pricing/infra/pricing.repository";

const decimalToNumber = (value: Prisma.Decimal | number | string | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const converted = Number(value);
  return Number.isFinite(converted) ? converted : 0;
};

const toPricingRulesPayload = (rule: ActivePricingRule): Record<string, unknown> => {
  const urgencyMap = new Map(rule.pricing_urgency_rules.map((item) => [item.urgency, decimalToNumber(item.addon_brl)]));
  const conditionalMap = new Map(
    rule.pricing_conditional_rules.map((item) => [item.condition_key, decimalToNumber(item.addon_brl)]),
  );

  return {
    urgency_addon_brl: {
      padrao: urgencyMap.get("padrao") ?? 0,
      urgente: urgencyMap.get("urgente") ?? 0,
      agendado: urgencyMap.get("agendado") ?? 0,
    },
    conditional_addons_brl: {
      sunday: conditionalMap.get("sunday") ?? 0,
      holiday: conditionalMap.get("holiday") ?? 0,
      rain: conditionalMap.get("rain") ?? 0,
      peak: conditionalMap.get("peak") ?? 0,
    },
    distance_zones_brl: rule.pricing_zone_rules
      .slice()
      .sort((a, b) => a.zone - b.zone)
      .map((zoneRule) => ({
        zone: zoneRule.zone,
        min_km: decimalToNumber(zoneRule.min_km),
        max_km: decimalToNumber(zoneRule.max_km),
        value_brl: decimalToNumber(zoneRule.base_value_brl),
      })),
    minimum_charge_brl: decimalToNumber(rule.minimum_charge_brl),
    max_distance_km: decimalToNumber(rule.max_distance_km),
  };
};

export class PricingAdminService {
  constructor(private readonly pricingRepository = new PricingRepository()) {}

  public async getPricingRules(): Promise<Record<string, unknown>> {
    const activeRule = await this.pricingRepository.findActiveRule(new Date());
    if (!activeRule) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "Pricing rules are not configured.",
        statusCode: 503,
      });
    }

    return toPricingRulesPayload(activeRule);
  }

  public async updatePricingRules(input: {
    payload: PricingRulesUpdateRequest;
    adminUserId: string;
  }): Promise<Record<string, unknown>> {
    const nextRule = await this.pricingRepository.replaceActiveRule({
      payload: input.payload,
      createdByUserId: input.adminUserId,
    });

    return toPricingRulesPayload(nextRule);
  }
}

