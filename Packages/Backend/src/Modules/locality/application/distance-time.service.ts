import { env } from "@core/config/env";
import { logger } from "@core/observability/logger";
import type {
  DistanceTimeResolution,
  LocalityBairroRef,
  QuoteProviderAttemptInput,
} from "@modules/locality/domain/locality.types";
import {
  getBairroCoordinatesMap,
  getFreightFallbackPolicy,
  normalizeBairro,
  type ProviderPolicy,
} from "@modules/locality/infra/freight-policy.loader";
import { LocalityRepository } from "@modules/locality/infra/locality.repository";

type DistanceProviderResult =
  | {
      success: true;
      distanceM: number;
      durationS: number;
      responseSample?: Record<string, unknown>;
    }
  | {
      success: false;
      errorCode: string;
      responseSample?: Record<string, unknown>;
    };

type Coordinates = {
  lat: number;
  lon: number;
};

const delay = async (milliseconds: number): Promise<void> => {
  if (milliseconds <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const parseNumber = (value: unknown): number | undefined => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const isValidDistanceDuration = (distanceM: number, durationS: number): boolean => {
  return Number.isFinite(distanceM) && Number.isFinite(durationS) && distanceM > 0 && durationS > 0;
};

const readTomTomDistanceDuration = (
  payload: Record<string, unknown>,
): { distanceM: number; durationS: number } | undefined => {
  const matrix = payload.matrix as unknown[] | undefined;
  const firstRow = Array.isArray(matrix) ? (matrix[0] as unknown[] | undefined) : undefined;
  const firstCell = Array.isArray(firstRow) ? (firstRow[0] as Record<string, unknown> | undefined) : undefined;
  const routeSummary =
    firstCell && typeof firstCell.response === "object" && firstCell.response !== null
      ? ((firstCell.response as Record<string, unknown>).routeSummary as
          | Record<string, unknown>
          | undefined)
      : undefined;

  const distanceM = parseNumber(routeSummary?.lengthInMeters);
  const durationS = parseNumber(routeSummary?.travelTimeInSeconds);

  if (distanceM === undefined || durationS === undefined) {
    return undefined;
  }

  return { distanceM, durationS };
};

const readOrsDistanceDuration = (
  payload: Record<string, unknown>,
): { distanceM: number; durationS: number } | undefined => {
  const distances = payload.distances as unknown[] | undefined;
  const durations = payload.durations as unknown[] | undefined;

  const distanceRow = Array.isArray(distances) ? (distances[0] as unknown[] | undefined) : undefined;
  const durationRow = Array.isArray(durations) ? (durations[0] as unknown[] | undefined) : undefined;

  const distanceM = Array.isArray(distanceRow) ? parseNumber(distanceRow[1]) : undefined;
  const durationS = Array.isArray(durationRow) ? parseNumber(durationRow[1]) : undefined;

  if (distanceM === undefined || durationS === undefined) {
    return undefined;
  }

  return { distanceM, durationS };
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

    logger.warn(
      {
        error,
        url,
      },
      "distance_provider_request_failed",
    );

    return {
      ok: false,
      errorCode: "REQUEST_FAILED",
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
};

export class DistanceTimeService {
  constructor(
    private readonly localityRepository = new LocalityRepository(),
    private readonly policy = getFreightFallbackPolicy(),
  ) {}

  private async resolveBairros(
    originBairroName: string,
    destinationBairroName: string,
  ): Promise<{ originBairro?: LocalityBairroRef; destinationBairro?: LocalityBairroRef }> {
    const [originBairro, destinationBairro] = await Promise.all([
      this.localityRepository.findActiveBairroByNormalizedName(normalizeBairro(originBairroName)),
      this.localityRepository.findActiveBairroByNormalizedName(
        normalizeBairro(destinationBairroName),
      ),
    ]);

    return {
      originBairro: originBairro
        ? {
            id: originBairro.id,
            name: originBairro.name,
            normalizedName: originBairro.normalized_name,
          }
        : undefined,
      destinationBairro: destinationBairro
        ? {
            id: destinationBairro.id,
            name: destinationBairro.name,
            normalizedName: destinationBairro.normalized_name,
          }
        : undefined,
    };
  }

  private getCoordinates(normalizedBairroName: string): Coordinates | undefined {
    const coordinatesMap = getBairroCoordinatesMap();
    return coordinatesMap.get(normalizedBairroName);
  }

  private async resolveByLocalMatrix(
    originBairroId: string,
    destinationBairroId: string,
  ): Promise<DistanceProviderResult> {
    const matrix = await this.localityRepository.findMatrixByBairros(
      originBairroId,
      destinationBairroId,
    );

    if (!matrix) {
      return {
        success: false,
        errorCode: "MATRIX_NOT_FOUND",
      };
    }

    if (!isValidDistanceDuration(matrix.distance_m, matrix.duration_s)) {
      return {
        success: false,
        errorCode: "MATRIX_INVALID_VALUES",
      };
    }

    return {
      success: true,
      distanceM: matrix.distance_m,
      durationS: matrix.duration_s,
      responseSample: {
        source_provider: matrix.source_provider,
      },
    };
  }

  private async resolveByTomTom(
    provider: ProviderPolicy,
    originCoordinates: Coordinates | undefined,
    destinationCoordinates: Coordinates | undefined,
  ): Promise<DistanceProviderResult> {
    if (!env.tomtomApiKey) {
      return {
        success: false,
        errorCode: "PROVIDER_NOT_CONFIGURED",
      };
    }

    if (!originCoordinates || !destinationCoordinates) {
      return {
        success: false,
        errorCode: "COORDINATES_NOT_FOUND",
      };
    }

    const endpoint = provider.request?.endpoint;
    if (!endpoint) {
      return {
        success: false,
        errorCode: "PROVIDER_ENDPOINT_MISSING",
      };
    }

    const url = `${endpoint}/sync/json?apiKey=${encodeURIComponent(env.tomtomApiKey)}`;
    const response = await fetchJsonWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origins: [
            {
              point: {
                latitude: originCoordinates.lat,
                longitude: originCoordinates.lon,
              },
            },
          ],
          destinations: [
            {
              point: {
                latitude: destinationCoordinates.lat,
                longitude: destinationCoordinates.lon,
              },
            },
          ],
          routeType: "fastest",
        }),
      },
      provider.timeout_ms,
    );

    if (!response.ok) {
      return {
        success: false,
        errorCode: response.errorCode,
      };
    }

    const parsedValues = readTomTomDistanceDuration(response.data);
    if (!parsedValues || !isValidDistanceDuration(parsedValues.distanceM, parsedValues.durationS)) {
      return {
        success: false,
        errorCode: "INVALID_RESPONSE",
      };
    }

    return {
      success: true,
      distanceM: Math.round(parsedValues.distanceM),
      durationS: Math.round(parsedValues.durationS),
    };
  }

  private async resolveByOpenRouteService(
    provider: ProviderPolicy,
    originCoordinates: Coordinates | undefined,
    destinationCoordinates: Coordinates | undefined,
  ): Promise<DistanceProviderResult> {
    if (!env.openRouteServiceApiKey) {
      return {
        success: false,
        errorCode: "PROVIDER_NOT_CONFIGURED",
      };
    }

    if (!originCoordinates || !destinationCoordinates) {
      return {
        success: false,
        errorCode: "COORDINATES_NOT_FOUND",
      };
    }

    const endpoint = provider.request?.endpoint;
    if (!endpoint) {
      return {
        success: false,
        errorCode: "PROVIDER_ENDPOINT_MISSING",
      };
    }

    const response = await fetchJsonWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: env.openRouteServiceApiKey,
        },
        body: JSON.stringify({
          locations: [
            [originCoordinates.lon, originCoordinates.lat],
            [destinationCoordinates.lon, destinationCoordinates.lat],
          ],
          metrics: ["distance", "duration"],
          units: "m",
        }),
      },
      provider.timeout_ms,
    );

    if (!response.ok) {
      return {
        success: false,
        errorCode: response.errorCode,
      };
    }

    const parsedValues = readOrsDistanceDuration(response.data);
    if (!parsedValues || !isValidDistanceDuration(parsedValues.distanceM, parsedValues.durationS)) {
      return {
        success: false,
        errorCode: "INVALID_RESPONSE",
      };
    }

    return {
      success: true,
      distanceM: Math.round(parsedValues.distanceM),
      durationS: Math.round(parsedValues.durationS),
    };
  }

  private async resolveDistanceByProvider(
    provider: ProviderPolicy,
    originBairro: LocalityBairroRef,
    destinationBairro: LocalityBairroRef,
  ): Promise<DistanceProviderResult> {
    if (provider.id === "local_bairro_matrix") {
      return this.resolveByLocalMatrix(originBairro.id, destinationBairro.id);
    }

    const originCoordinates = this.getCoordinates(originBairro.normalizedName);
    const destinationCoordinates = this.getCoordinates(destinationBairro.normalizedName);

    if (provider.id === "tomtom_matrix") {
      return this.resolveByTomTom(provider, originCoordinates, destinationCoordinates);
    }

    if (provider.id === "openrouteservice_matrix") {
      return this.resolveByOpenRouteService(provider, originCoordinates, destinationCoordinates);
    }

    return {
      success: false,
      errorCode: "PROVIDER_NOT_SUPPORTED",
    };
  }

  public async resolveDistanceTime(input: {
    originBairroName: string;
    destinationBairroName: string;
  }): Promise<DistanceTimeResolution> {
    const attempts: QuoteProviderAttemptInput[] = [];
    const { originBairro, destinationBairro } = await this.resolveBairros(
      input.originBairroName,
      input.destinationBairroName,
    );

    if (!originBairro || !destinationBairro) {
      return {
        success: false,
        errorCode: "OUT_OF_COVERAGE",
        errorMessage: "Origin or destination bairro is not covered by the platform.",
        attempts,
      };
    }

    const enabledProviders = this.policy.domains.distance_time.providers
      .filter((provider) => provider.enabled)
      .sort((left, right) => left.priority - right.priority);

    const firstProviderId = enabledProviders[0]?.id;

    for (const provider of enabledProviders) {
      const totalAttempts = Math.max(1, provider.max_retries + 1);

      for (let attemptNo = 1; attemptNo <= totalAttempts; attemptNo += 1) {
        const startedAt = Date.now();
        const result = await this.resolveDistanceByProvider(
          provider,
          originBairro,
          destinationBairro,
        );
        const latencyMs = Date.now() - startedAt;

        if (result.success) {
          attempts.push({
            domainKey: "distance_time",
            providerId: provider.id,
            attemptNo,
            success: true,
            latencyMs,
            responseSample: result.responseSample,
          });

          return {
            success: true,
            originBairro,
            destinationBairro,
            distanceM: result.distanceM,
            durationS: result.durationS,
            providerId: provider.id,
            fallbackUsed: provider.id !== firstProviderId,
            latencyMs,
            attempts,
          };
        }

        attempts.push({
          domainKey: "distance_time",
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

    return {
      success: false,
      errorCode: this.policy.domains.distance_time.on_all_fail.code,
      errorMessage: this.policy.domains.distance_time.on_all_fail.message,
      attempts,
      originBairro,
      destinationBairro,
    };
  }
}
