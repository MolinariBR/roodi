export type QuoteDomainKey = "distance_time" | "climate";

export type QuoteProviderAttemptInput = {
  domainKey: QuoteDomainKey;
  providerId: string;
  attemptNo: number;
  success: boolean;
  latencyMs?: number;
  errorCode?: string;
  responseSample?: Record<string, unknown>;
};

export type LocalityBairroRef = {
  id: string;
  name: string;
  normalizedName: string;
};

export type DistanceTimeResolutionSuccess = {
  success: true;
  originBairro: LocalityBairroRef;
  destinationBairro: LocalityBairroRef;
  distanceM: number;
  durationS: number;
  providerId: string;
  fallbackUsed: boolean;
  latencyMs: number;
  attempts: QuoteProviderAttemptInput[];
};

export type DistanceTimeResolutionFailure = {
  success: false;
  errorCode: "DISTANCE_TIME_UNAVAILABLE" | "OUT_OF_COVERAGE";
  errorMessage: string;
  attempts: QuoteProviderAttemptInput[];
  originBairro?: LocalityBairroRef;
  destinationBairro?: LocalityBairroRef;
};

export type DistanceTimeResolution =
  | DistanceTimeResolutionSuccess
  | DistanceTimeResolutionFailure;
