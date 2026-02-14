import type { pricing_peak_windows, pricing_zone_rules } from "@prisma/client";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";
import { logger } from "@core/observability/logger";
import { DistanceTimeService } from "@modules/locality/application/distance-time.service";
import { getBairroCoordinatesMap, getFreightFallbackPolicy } from "@modules/locality/infra/freight-policy.loader";
import type { QuoteProviderAttemptInput } from "@modules/locality/domain/locality.types";
import type { QuoteRequest } from "@modules/pricing/domain/quote.schemas";
import { PricingRepository } from "@modules/pricing/infra/pricing.repository";
import { QuoteRepository } from "@modules/pricing/infra/quote.repository";

type ClimateResolution = {
  isRaining: boolean;
  source: string;
  confidence: "high" | "medium" | "low";
  providerId: string;
  fallbackUsed: boolean;
  latencyMs: number;
  attempts: QuoteProviderAttemptInput[];
};

type ClimateProviderResult =
  | {
      success: true;
      isRaining: boolean;
      confidence: "high" | "medium" | "low";
      responseSample?: Record<string, unknown>;
    }
  | {
      success: false;
      errorCode: string;
      responseSample?: Record<string, unknown>;
    };

type LocalDateContext = {
  localDateIso: string;
  localHour: number;
  isSunday: boolean;
  utcDateStart: Date;
};

type Coordinates = {
  lat: number;
  lon: number;
};

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const decimalToNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const delay = async (milliseconds: number): Promise<void> => {
  if (milliseconds <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const getLocalDateContext = (requestedAtIso: Date, timezone: string): LocalDateContext => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });

  const parts = formatter.formatToParts(requestedAtIso);
  const getPart = (type: Intl.DateTimeFormatPartTypes): string => {
    return parts.find((part) => part.type === type)?.value ?? "";
  };

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  const hour = Number.parseInt(getPart("hour"), 10);
  const weekday = getPart("weekday");
  const localDateIso = `${year}-${month}-${day}`;
  const utcDateStart = new Date(`${localDateIso}T00:00:00.000Z`);

  return {
    localDateIso,
    localHour: Number.isNaN(hour) ? 0 : hour,
    isSunday: weekday === "Sun",
    utcDateStart,
  };
};

const isWithinPeakWindow = (localHour: number, windows: pricing_peak_windows[]): boolean => {
  return windows.some((window) => localHour >= window.start_hour && localHour < window.end_hour);
};

const resolveZoneRule = (
  distanceKm: number,
  zoneRules: pricing_zone_rules[],
): pricing_zone_rules | undefined => {
  return zoneRules.find((zoneRule) => {
    const minKm = decimalToNumber(zoneRule.min_km);
    const maxKm = decimalToNumber(zoneRule.max_km);
    return distanceKm >= minKm && distanceKm <= maxKm;
  });
};

const fetchJsonWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; errorCode: string }> => {
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: abortController.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        errorCode: `HTTP_${response.status}`,
      };
    }

    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return {
        ok: false,
        errorCode: "INVALID_RESPONSE",
      };
    }

    return {
      ok: true,
      data: payload as Record<string, unknown>,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        errorCode: "TIMEOUT",
      };
    }

    logger.warn({ error, url }, "climate_provider_request_failed");
    return {
      ok: false,
      errorCode: "REQUEST_FAILED",
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
};

const getCoordinatesByNormalizedName = (normalizedBairroName: string): Coordinates | undefined => {
  const map = getBairroCoordinatesMap();
  return map.get(normalizedBairroName);
};

const extractOpenWeatherRainRate = (payload: Record<string, unknown>): number => {
  const current = payload.current as Record<string, unknown> | undefined;
  const currentRain = current?.rain as Record<string, unknown> | undefined;
  const hourly = payload.hourly as unknown[] | undefined;
  const hourlyFirst = Array.isArray(hourly)
    ? (hourly[0] as Record<string, unknown> | undefined)
    : undefined;
  const hourlyRain = hourlyFirst?.rain as Record<string, unknown> | undefined;

  const byCurrent = parseNumber(currentRain?.["1h"]);
  if (byCurrent !== undefined) {
    return byCurrent;
  }

  const byHourly = parseNumber(hourlyRain?.["1h"]);
  return byHourly ?? 0;
};

const extractMetNoRainRate = (payload: Record<string, unknown>): number => {
  const timeseries = payload.timeseries as unknown[] | undefined;
  const firstSeries = Array.isArray(timeseries)
    ? (timeseries[0] as Record<string, unknown> | undefined)
    : undefined;
  const firstData = firstSeries?.data as Record<string, unknown> | undefined;
  const next1Hour = firstData?.next_1_hours as Record<string, unknown> | undefined;
  const details = next1Hour?.details as Record<string, unknown> | undefined;
  const precipitationAmount = parseNumber(details?.precipitation_amount);

  return precipitationAmount ?? 0;
};

export class QuoteService {
  constructor(
    private readonly distanceTimeService = new DistanceTimeService(),
    private readonly pricingRepository = new PricingRepository(),
    private readonly quoteRepository = new QuoteRepository(),
    private readonly policy = getFreightFallbackPolicy(),
  ) {}

  private async resolveClimate(
    destinationNormalizedName: string,
  ): Promise<ClimateResolution> {
    const attempts: QuoteProviderAttemptInput[] = [];
    const providers = this.policy.domains.climate.providers
      .filter((provider) => provider.enabled)
      .sort((left, right) => left.priority - right.priority);
    const firstProviderId = providers[0]?.id;

    for (const provider of providers) {
      const totalAttempts = Math.max(1, provider.max_retries + 1);

      for (let attemptNo = 1; attemptNo <= totalAttempts; attemptNo += 1) {
        const startedAt = Date.now();
        const result = await this.resolveClimateByProvider(
          provider,
          destinationNormalizedName,
        );
        const latencyMs = Date.now() - startedAt;

        if (result.success) {
          attempts.push({
            domainKey: "climate",
            providerId: provider.id,
            attemptNo,
            success: true,
            latencyMs,
            responseSample: result.responseSample,
          });

          return {
            isRaining: result.isRaining,
            source: provider.id,
            confidence: result.confidence,
            providerId: provider.id,
            fallbackUsed: provider.id !== firstProviderId,
            latencyMs,
            attempts,
          };
        }

        attempts.push({
          domainKey: "climate",
          providerId: provider.id,
          attemptNo,
          success: false,
          latencyMs,
          errorCode: result.errorCode,
          responseSample: result.responseSample,
        });

        if (attemptNo < totalAttempts) {
          await delay(provider.retry_backoff_ms ?? 0);
        }
      }
    }

    const climateDefault = this.policy.domains.climate.on_all_fail.default;

    return {
      isRaining: climateDefault.is_raining,
      source: climateDefault.source,
      confidence: climateDefault.confidence,
      providerId: climateDefault.source,
      fallbackUsed: true,
      latencyMs: 0,
      attempts,
    };
  }

  private async resolveClimateByProvider(
    provider: {
      id: string;
      timeout_ms: number;
      request?: { endpoint?: string };
      rain_detection?: { is_raining_if_mm_per_h_gte?: number };
    },
    destinationNormalizedName: string,
  ): Promise<ClimateProviderResult> {
    const coordinates = getCoordinatesByNormalizedName(destinationNormalizedName);
    if (!coordinates) {
      return {
        success: false,
        errorCode: "COORDINATES_NOT_FOUND",
      };
    }

    if (provider.id === "openweather") {
      if (!env.openWeatherApiKey) {
        return {
          success: false,
          errorCode: "PROVIDER_NOT_CONFIGURED",
        };
      }

      const endpoint = provider.request?.endpoint;
      if (!endpoint) {
        return {
          success: false,
          errorCode: "PROVIDER_ENDPOINT_MISSING",
        };
      }

      const threshold = provider.rain_detection?.is_raining_if_mm_per_h_gte ?? 0.1;
      const url =
        `${endpoint}?lat=${coordinates.lat}&lon=${coordinates.lon}` +
        `&exclude=minutely,daily,alerts&units=metric&appid=${encodeURIComponent(env.openWeatherApiKey)}`;
      const response = await fetchJsonWithTimeout(
        url,
        {
          method: "GET",
        },
        provider.timeout_ms,
      );

      if (!response.ok) {
        return {
          success: false,
          errorCode: response.errorCode,
        };
      }

      const rainRate = extractOpenWeatherRainRate(response.data);
      return {
        success: true,
        isRaining: rainRate >= threshold,
        confidence: "high",
      };
    }

    if (provider.id === "met_no") {
      const endpoint = provider.request?.endpoint ?? env.metNoBaseUrl;
      if (!endpoint) {
        return {
          success: false,
          errorCode: "PROVIDER_ENDPOINT_MISSING",
        };
      }

      const threshold = provider.rain_detection?.is_raining_if_mm_per_h_gte ?? 0.1;
      const url = `${endpoint}?lat=${coordinates.lat}&lon=${coordinates.lon}`;
      const response = await fetchJsonWithTimeout(
        url,
        {
          method: "GET",
          headers: {
            "User-Agent": "roodi-backend/1.0 (+https://roodi.app)",
          },
        },
        provider.timeout_ms,
      );

      if (!response.ok) {
        return {
          success: false,
          errorCode: response.errorCode,
        };
      }

      const rainRate = extractMetNoRainRate(response.data);
      return {
        success: true,
        isRaining: rainRate >= threshold,
        confidence: "medium",
      };
    }

    return {
      success: false,
      errorCode: "PROVIDER_NOT_SUPPORTED",
    };
  }

  public async createQuote(input: {
    commerceUserId: string;
    payload: QuoteRequest;
  }): Promise<{
    success: true;
    data: {
      quote_id: string;
      currency: string;
      origin_bairro: string;
      destination_bairro: string;
      distance_m: number;
      duration_s: number;
      eta_min: number;
      zone: number;
      price: {
        base_zone_brl: number;
        urgency_brl: number;
        sunday_brl: number;
        holiday_brl: number;
        rain_brl: number;
        peak_brl: number;
        total_brl: number;
      };
      climate: {
        is_raining: boolean;
        source: string;
        confidence: "high" | "medium" | "low";
      };
      provider_trace: {
        distance_time_provider: string;
        climate_provider: string;
        fallback_used: boolean;
        latency_ms: {
          distance_time: number;
          climate: number;
        };
      };
    };
  }> {
    const commerceUser = await this.pricingRepository.findCommerceUserById(input.commerceUserId);
    if (!commerceUser) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid access token.",
        statusCode: 401,
      });
    }

    const requestedAtIso = new Date(input.payload.requested_at_iso);
    if (Number.isNaN(requestedAtIso.getTime())) {
      throw new AppError({
        code: "VALIDATION_ERROR",
        message: "Invalid requested_at_iso.",
        statusCode: 422,
      });
    }

    const distanceTime = await this.distanceTimeService.resolveDistanceTime({
      originBairroName: input.payload.origin_bairro,
      destinationBairroName: input.payload.destination_bairro,
    });

    if (!distanceTime.success) {
      if (
        distanceTime.originBairro &&
        distanceTime.destinationBairro &&
        distanceTime.errorCode === "DISTANCE_TIME_UNAVAILABLE"
      ) {
        const persistedFailure = await this.quoteRepository.persistQuoteWithAttempts({
          commerceUserId: commerceUser.id,
          originBairroId: distanceTime.originBairro.id,
          destinationBairroId: distanceTime.destinationBairro.id,
          urgency: input.payload.urgency,
          requestedAtIso,
          success: false,
          errorCode: distanceTime.errorCode,
          errorMessage: distanceTime.errorMessage,
          distanceTimeProvider: undefined,
          climateProvider: undefined,
          fallbackUsed: true,
          attempts: distanceTime.attempts,
        });

        throw new AppError({
          code: "DISTANCE_TIME_UNAVAILABLE",
          message: distanceTime.errorMessage,
          statusCode: 422,
          details: {
            quote_id: persistedFailure.quoteId,
          },
        });
      }

      throw new AppError({
        code: "OUT_OF_COVERAGE",
        message: distanceTime.errorMessage,
        statusCode: 422,
      });
    }

    const pricingRule = await this.pricingRepository.findActiveRule(requestedAtIso);
    if (!pricingRule) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "Pricing rule is not configured.",
        statusCode: 503,
      });
    }

    const distanceKm = distanceTime.distanceM / 1000;
    const maxDistanceKm = decimalToNumber(pricingRule.max_distance_km);
    const zoneRule = resolveZoneRule(distanceKm, pricingRule.pricing_zone_rules);

    if (!zoneRule || distanceKm > maxDistanceKm) {
      const persistedFailure = await this.quoteRepository.persistQuoteWithAttempts({
        commerceUserId: commerceUser.id,
        originBairroId: distanceTime.originBairro.id,
        destinationBairroId: distanceTime.destinationBairro.id,
        urgency: input.payload.urgency,
        requestedAtIso,
        success: false,
        errorCode: "OUT_OF_COVERAGE",
        errorMessage: "Distance above platform coverage.",
        distanceM: distanceTime.distanceM,
        durationS: distanceTime.durationS,
        distanceTimeProvider: distanceTime.providerId,
        fallbackUsed: distanceTime.fallbackUsed,
        distanceTimeLatencyMs: distanceTime.latencyMs,
        attempts: distanceTime.attempts,
      });

      throw new AppError({
        code: "OUT_OF_COVERAGE",
        message: "Distance above platform coverage.",
        statusCode: 422,
        details: {
          quote_id: persistedFailure.quoteId,
        },
      });
    }

    const climate = await this.resolveClimate(distanceTime.destinationBairro.normalizedName);
    const localDateContext = getLocalDateContext(requestedAtIso, this.policy.context.timezone);
    const isSunday = input.payload.is_sunday ?? localDateContext.isSunday;
    const isPeak =
      input.payload.is_peak ??
      isWithinPeakWindow(localDateContext.localHour, pricingRule.pricing_peak_windows);
    const holiday = await this.pricingRepository.findHolidayByDate(localDateContext.utcDateStart);
    const isHoliday = input.payload.is_holiday ?? Boolean(holiday);

    const urgencyRule = pricingRule.pricing_urgency_rules.find(
      (item) => item.urgency === input.payload.urgency,
    );
    const conditionalRules = new Map(
      pricingRule.pricing_conditional_rules.map((item) => [
        item.condition_key,
        decimalToNumber(item.addon_brl),
      ]),
    );

    const baseZoneBrl = decimalToNumber(zoneRule.base_value_brl);
    const urgencyBrl = urgencyRule ? decimalToNumber(urgencyRule.addon_brl) : 0;
    const sundayBrl = isSunday ? conditionalRules.get("sunday") ?? 0 : 0;
    const holidayBrl = isHoliday ? conditionalRules.get("holiday") ?? 0 : 0;
    const rainBrl = climate.isRaining ? conditionalRules.get("rain") ?? 0 : 0;
    const peakBrl = isPeak ? conditionalRules.get("peak") ?? 0 : 0;
    const minimumChargeBrl = decimalToNumber(pricingRule.minimum_charge_brl);

    const subtotal = baseZoneBrl + urgencyBrl + sundayBrl + holidayBrl + rainBrl + peakBrl;
    const totalBrl = roundMoney(Math.max(subtotal, minimumChargeBrl));
    const etaMin = Math.max(1, Math.ceil(distanceTime.durationS / 60));

    const attempts = [...distanceTime.attempts, ...climate.attempts];
    const persistedQuote = await this.quoteRepository.persistQuoteWithAttempts({
      commerceUserId: commerceUser.id,
      originBairroId: distanceTime.originBairro.id,
      destinationBairroId: distanceTime.destinationBairro.id,
      urgency: input.payload.urgency,
      requestedAtIso,
      success: true,
      distanceM: distanceTime.distanceM,
      durationS: distanceTime.durationS,
      etaMin,
      zone: zoneRule.zone,
      baseZoneBrl,
      urgencyBrl,
      sundayBrl,
      holidayBrl,
      rainBrl,
      peakBrl,
      totalBrl,
      isRaining: climate.isRaining,
      climateSource: climate.source,
      climateConfidence: climate.confidence,
      distanceTimeProvider: distanceTime.providerId,
      climateProvider: climate.providerId,
      fallbackUsed: distanceTime.fallbackUsed || climate.fallbackUsed,
      distanceTimeLatencyMs: distanceTime.latencyMs,
      climateLatencyMs: climate.latencyMs,
      attempts,
    });

    return {
      success: true,
      data: {
        quote_id: persistedQuote.quoteId,
        currency: this.policy.context.currency,
        origin_bairro: distanceTime.originBairro.name,
        destination_bairro: distanceTime.destinationBairro.name,
        distance_m: distanceTime.distanceM,
        duration_s: distanceTime.durationS,
        eta_min: etaMin,
        zone: zoneRule.zone,
        price: {
          base_zone_brl: roundMoney(baseZoneBrl),
          urgency_brl: roundMoney(urgencyBrl),
          sunday_brl: roundMoney(sundayBrl),
          holiday_brl: roundMoney(holidayBrl),
          rain_brl: roundMoney(rainBrl),
          peak_brl: roundMoney(peakBrl),
          total_brl: totalBrl,
        },
        climate: {
          is_raining: climate.isRaining,
          source: climate.source,
          confidence: climate.confidence,
        },
        provider_trace: {
          distance_time_provider: distanceTime.providerId,
          climate_provider: climate.providerId,
          fallback_used: distanceTime.fallbackUsed || climate.fallbackUsed,
          latency_ms: {
            distance_time: distanceTime.latencyMs,
            climate: climate.latencyMs,
          },
        },
      },
    };
  }
}
