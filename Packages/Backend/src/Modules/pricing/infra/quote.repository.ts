import type { Prisma, PrismaClient, urgency_type } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { QuoteProviderAttemptInput } from "@modules/locality/domain/locality.types";

type PersistQuoteInput = {
  commerceUserId: string;
  originBairroId: string;
  destinationBairroId: string;
  urgency: urgency_type;
  requestedAtIso: Date;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  distanceM?: number;
  durationS?: number;
  etaMin?: number;
  zone?: number;
  baseZoneBrl?: number;
  urgencyBrl?: number;
  sundayBrl?: number;
  holidayBrl?: number;
  rainBrl?: number;
  peakBrl?: number;
  totalBrl?: number;
  isRaining?: boolean;
  climateSource?: string;
  climateConfidence?: string;
  distanceTimeProvider?: string;
  climateProvider?: string;
  fallbackUsed?: boolean;
  distanceTimeLatencyMs?: number;
  climateLatencyMs?: number;
  expiresAt?: Date;
  attempts: QuoteProviderAttemptInput[];
};

const toDecimalString = (value: number | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return value.toFixed(2);
};

export class QuoteRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public async persistQuoteWithAttempts(input: PersistQuoteInput): Promise<{ quoteId: string }> {
    const quote = await this.prismaClient.$transaction(async (tx) => {
      const createdQuote = await tx.quotes.create({
        data: {
          commerce_user_id: input.commerceUserId,
          origin_bairro_id: input.originBairroId,
          destination_bairro_id: input.destinationBairroId,
          urgency: input.urgency,
          requested_at_iso: input.requestedAtIso,
          success: input.success,
          error_code: input.errorCode,
          error_message: input.errorMessage,
          distance_m: input.distanceM,
          duration_s: input.durationS,
          eta_min: input.etaMin,
          zone: input.zone,
          base_zone_brl: toDecimalString(input.baseZoneBrl),
          urgency_brl: toDecimalString(input.urgencyBrl),
          sunday_brl: toDecimalString(input.sundayBrl),
          holiday_brl: toDecimalString(input.holidayBrl),
          rain_brl: toDecimalString(input.rainBrl),
          peak_brl: toDecimalString(input.peakBrl),
          total_brl: toDecimalString(input.totalBrl),
          is_raining: input.isRaining,
          climate_source: input.climateSource,
          climate_confidence: input.climateConfidence,
          distance_time_provider: input.distanceTimeProvider,
          climate_provider: input.climateProvider,
          fallback_used: input.fallbackUsed,
          distance_time_latency_ms: input.distanceTimeLatencyMs,
          climate_latency_ms: input.climateLatencyMs,
          expires_at: input.expiresAt,
        },
        select: {
          id: true,
        },
      });

      if (input.attempts.length > 0) {
        await tx.quote_provider_attempts.createMany({
          data: input.attempts.map((attempt): Prisma.quote_provider_attemptsCreateManyInput => {
            return {
              quote_id: createdQuote.id,
              domain_key: attempt.domainKey,
              provider_id: attempt.providerId,
              attempt_no: attempt.attemptNo,
              success: attempt.success,
              latency_ms: attempt.latencyMs,
              error_code: attempt.errorCode,
              response_sample: attempt.responseSample as
                | Prisma.InputJsonValue
                | Prisma.NullableJsonNullValueInput
                | undefined,
            };
          }),
        });
      }

      return createdQuote;
    });

    return {
      quoteId: quote.id,
    };
  }
}
