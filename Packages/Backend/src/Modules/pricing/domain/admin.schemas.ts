import { z } from "zod";

const moneySchema = z
  .coerce
  .number()
  .min(0)
  .refine((value) => Number.isFinite(value), "Invalid number");

export const pricingZoneRuleSchema = z
  .object({
    zone: z.coerce.number().int().min(1),
    min_km: z.coerce.number().min(0),
    max_km: z.coerce.number().min(0),
    value_brl: moneySchema,
  })
  .superRefine((value, ctx) => {
    if (value.max_km < value.min_km) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_km"],
        message: "max_km must be greater than or equal to min_km",
      });
    }
  });

export const pricingRulesUpdateRequestSchema = z
  .object({
    urgency_addon_brl: z.object({
      padrao: moneySchema,
      urgente: moneySchema,
      agendado: moneySchema,
    }),
    conditional_addons_brl: z.object({
      sunday: moneySchema,
      holiday: moneySchema,
      rain: moneySchema,
      peak: moneySchema,
    }),
    distance_zones_brl: z.array(pricingZoneRuleSchema).min(1),
    minimum_charge_brl: moneySchema,
    max_distance_km: z.coerce.number().min(0).refine((value) => Number.isFinite(value), "Invalid number"),
  })
  .superRefine((value, ctx) => {
    const zones = value.distance_zones_brl.map((rule) => rule.zone);
    const uniqueZones = new Set(zones);
    if (uniqueZones.size !== zones.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["distance_zones_brl"],
        message: "distance_zones_brl zones must be unique",
      });
    }
  });

export type PricingRulesUpdateRequest = z.infer<typeof pricingRulesUpdateRequestSchema>;
