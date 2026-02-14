import fs from "node:fs";
import path from "node:path";

export type ProviderPolicy = {
  id: string;
  enabled: boolean;
  priority: number;
  timeout_ms: number;
  max_retries: number;
  retry_backoff_ms?: number;
  request?: {
    endpoint?: string;
  };
  rain_detection?: {
    is_raining_if_mm_per_h_gte?: number;
  };
};

export type FreightFallbackPolicy = {
  context: {
    currency: string;
    timezone: string;
  };
  domains: {
    distance_time: {
      providers: ProviderPolicy[];
      on_all_fail: {
        code: "DISTANCE_TIME_UNAVAILABLE";
        message: string;
      };
    };
    climate: {
      providers: ProviderPolicy[];
      on_all_fail: {
        default: {
          is_raining: boolean;
          source: string;
          confidence: "high" | "medium" | "low";
        };
      };
    };
  };
};

type MatrixBairro = {
  name: string;
  lat?: number;
  lon?: number;
};

type MatrixFile = {
  bairros: MatrixBairro[];
};

type BairroCoordinates = {
  lat: number;
  lon: number;
};

const POLICY_FILE_RELATIVE_PATH = ["Docs", "config", "freight-fallback-policy.json"];
const MATRIX_FILE_RELATIVE_PATH = ["Docs", "data", "imperatriz_bairros_matriz.json"];

let policyCache: FreightFallbackPolicy | undefined;
let coordinatesCache: Map<string, BairroCoordinates> | undefined;

const resolveFilePath = (relativePath: string[]): string => {
  const fromBackendRoot = path.resolve(process.cwd(), "..", "..", ...relativePath);
  if (fs.existsSync(fromBackendRoot)) {
    return fromBackendRoot;
  }

  const fromRepoRoot = path.resolve(process.cwd(), ...relativePath);
  if (fs.existsSync(fromRepoRoot)) {
    return fromRepoRoot;
  }

  throw new Error(`File not found: ${relativePath.join("/")}`);
};

const normalizeBairroName = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

export const getFreightFallbackPolicy = (): FreightFallbackPolicy => {
  if (policyCache) {
    return policyCache;
  }

  const filePath = resolveFilePath(POLICY_FILE_RELATIVE_PATH);
  const rawPolicy = JSON.parse(fs.readFileSync(filePath, "utf8")) as FreightFallbackPolicy;
  policyCache = rawPolicy;
  return rawPolicy;
};

export const getBairroCoordinatesMap = (): Map<string, BairroCoordinates> => {
  if (coordinatesCache) {
    return coordinatesCache;
  }

  const filePath = resolveFilePath(MATRIX_FILE_RELATIVE_PATH);
  const matrixFile = JSON.parse(fs.readFileSync(filePath, "utf8")) as MatrixFile;
  const map = new Map<string, BairroCoordinates>();

  for (const bairro of matrixFile.bairros) {
    if (!Number.isFinite(bairro.lat) || !Number.isFinite(bairro.lon)) {
      continue;
    }

    map.set(normalizeBairroName(bairro.name), {
      lat: Number(bairro.lat),
      lon: Number(bairro.lon),
    });
  }

  coordinatesCache = map;
  return map;
};

export const normalizeBairro = (value: string): string => normalizeBairroName(value);
