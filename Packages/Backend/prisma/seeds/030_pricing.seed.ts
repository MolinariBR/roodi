import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import { loadFreightPolicy } from "./_shared/loaders";

function toMoney(value: number): string {
  return value.toFixed(2);
}

const URGENCY_ORDER = ["padrao", "urgente", "agendado"] as const;
const CONDITIONAL_KEYS = ["sunday", "holiday", "rain", "peak"] as const;

export async function seedPricing({ prisma }: SeedContext): Promise<void> {
  const policy = loadFreightPolicy();
  const business = policy.business_rules;
  const versionCode = "PRC-2026-01";
  const minimumCharge = toMoney(business.pricing_formula.minimum_charge_brl);
  const maxDistanceKm = business.pricing_formula.max_distance_policy.when_distance_km_gt.toFixed(2);

  await prisma.pricing_rule_versions.upsert({
    where: { version_code: versionCode },
    update: {
      is_active: true,
      effective_from: new Date("2026-01-01T00:00:00.000Z"),
      effective_to: null,
      minimum_charge_brl: minimumCharge,
      max_distance_km: maxDistanceKm,
      notes: `Regra oficial carregada de Docs/config/freight-fallback-policy.json (v${policy.version}).`,
      created_by_user_id: null,
    },
    create: {
      id: seedIds.pricing.version202601,
      version_code: versionCode,
      is_active: true,
      effective_from: new Date("2026-01-01T00:00:00.000Z"),
      effective_to: null,
      minimum_charge_brl: minimumCharge,
      max_distance_km: maxDistanceKm,
      notes: `Regra oficial carregada de Docs/config/freight-fallback-policy.json (v${policy.version}).`,
      created_by_user_id: null,
    },
  });

  await prisma.pricing_rule_versions.updateMany({
    where: { NOT: { id: seedIds.pricing.version202601 } },
    data: { is_active: false },
  });

  const urgencyUpsertQuery = `
    INSERT INTO pricing_urgency_rules (rule_version_id, urgency, addon_brl)
    VALUES ($1::uuid, $2::urgency_type, $3::numeric)
    ON CONFLICT (rule_version_id, urgency)
    DO UPDATE SET addon_brl = EXCLUDED.addon_brl
  `;

  await prisma.pricing_urgency_rules.deleteMany({
    where: {
      rule_version_id: seedIds.pricing.version202601,
      urgency: {
        notIn: [...URGENCY_ORDER],
      },
    },
  });

  for (const urgency of URGENCY_ORDER) {
    const urgencyValue = business.urgency_addon_brl[urgency] ?? 0;
    await prisma.$executeRawUnsafe(
      urgencyUpsertQuery,
      seedIds.pricing.version202601,
      urgency,
      toMoney(urgencyValue),
    );
  }

  const zoneUpsertQuery = `
    INSERT INTO pricing_zone_rules (rule_version_id, zone, min_km, max_km, base_value_brl)
    VALUES ($1::uuid, $2::smallint, $3::numeric, $4::numeric, $5::numeric)
    ON CONFLICT (rule_version_id, zone)
    DO UPDATE SET
      min_km = EXCLUDED.min_km,
      max_km = EXCLUDED.max_km,
      base_value_brl = EXCLUDED.base_value_brl
  `;

  await prisma.pricing_zone_rules.deleteMany({
    where: {
      rule_version_id: seedIds.pricing.version202601,
      zone: {
        notIn: business.distance_zones_brl.map((item) => item.zone),
      },
    },
  });

  for (const zoneRule of business.distance_zones_brl) {
    await prisma.$executeRawUnsafe(
      zoneUpsertQuery,
      seedIds.pricing.version202601,
      zoneRule.zone,
      zoneRule.min_km.toFixed(2),
      zoneRule.max_km.toFixed(2),
      toMoney(zoneRule.value),
    );
  }

  const conditionalIdByKey: Record<(typeof CONDITIONAL_KEYS)[number], string> = {
    sunday: seedIds.pricing.conditionalSunday,
    holiday: seedIds.pricing.conditionalHoliday,
    rain: seedIds.pricing.conditionalRain,
    peak: seedIds.pricing.conditionalPeak,
  };

  await prisma.pricing_conditional_rules.deleteMany({
    where: {
      rule_version_id: seedIds.pricing.version202601,
      condition_key: {
        notIn: [...CONDITIONAL_KEYS],
      },
    },
  });

  for (const conditionKey of CONDITIONAL_KEYS) {
    const addonValue = business.conditional_addons_brl[conditionKey] ?? 0;

    await prisma.pricing_conditional_rules.upsert({
      where: { id: conditionalIdByKey[conditionKey] },
      update: {
        rule_version_id: seedIds.pricing.version202601,
        condition_key: conditionKey,
        addon_brl: toMoney(addonValue),
      },
      create: {
        id: conditionalIdByKey[conditionKey],
        rule_version_id: seedIds.pricing.version202601,
        condition_key: conditionKey,
        addon_brl: toMoney(addonValue),
      },
    });
  }

  await prisma.pricing_peak_windows.deleteMany({
    where: {
      rule_version_id: seedIds.pricing.version202601,
      id: {
        notIn: [seedIds.pricing.peakLunch, seedIds.pricing.peakDinner],
      },
    },
  });

  await prisma.pricing_peak_windows.upsert({
    where: { id: seedIds.pricing.peakLunch },
    update: {
      rule_version_id: seedIds.pricing.version202601,
      start_hour: 11,
      end_hour: 14,
    },
    create: {
      id: seedIds.pricing.peakLunch,
      rule_version_id: seedIds.pricing.version202601,
      start_hour: 11,
      end_hour: 14,
    },
  });

  await prisma.pricing_peak_windows.upsert({
    where: { id: seedIds.pricing.peakDinner },
    update: {
      rule_version_id: seedIds.pricing.version202601,
      start_hour: 18,
      end_hour: 22,
    },
    create: {
      id: seedIds.pricing.peakDinner,
      rule_version_id: seedIds.pricing.version202601,
      start_hour: 18,
      end_hour: 22,
    },
  });

  await prisma.pricing_holidays.upsert({
    where: { holiday_date: new Date("2026-01-01T00:00:00.000Z") },
    update: {
      description: "Confraternizacao Universal",
      is_active: true,
    },
    create: {
      holiday_date: new Date("2026-01-01T00:00:00.000Z"),
      description: "Confraternizacao Universal",
      is_active: true,
    },
  });
}
