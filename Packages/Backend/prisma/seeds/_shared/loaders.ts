import fs from "node:fs";
import path from "node:path";

interface FreightPolicyBusinessRules {
  urgency_addon_brl: Record<string, number>;
  distance_zones_brl: Array<{
    zone: number;
    min_km: number;
    max_km: number;
    value: number;
  }>;
  conditional_addons_brl: Record<string, number>;
  pricing_formula: {
    minimum_charge_brl: number;
    max_distance_policy: {
      when_distance_km_gt: number;
    };
  };
}

export interface FreightPolicy {
  version: string;
  context: {
    city: string;
    state?: string;
    country: string;
    currency: string;
    timezone: string;
    updated_at: string;
    pricing_owner: string;
  };
  business_rules: FreightPolicyBusinessRules;
}

interface MatrixBairro {
  index: number;
  name: string;
  status: string;
  lat?: number;
  lon?: number;
}

interface ImperatrizMatrix {
  generated_at: string;
  city: {
    name: string;
    state: string;
    country: string;
  };
  bairros: MatrixBairro[];
  matrix: {
    order: string[];
    distance_m: number[][];
    duration_s: number[][];
  };
}

function resolvePath(relativeParts: string[]): string {
  const fromBackendRoot = path.resolve(process.cwd(), "..", "..", ...relativeParts);
  if (fs.existsSync(fromBackendRoot)) {
    return fromBackendRoot;
  }

  const fromRepoRoot = path.resolve(process.cwd(), ...relativeParts);
  if (fs.existsSync(fromRepoRoot)) {
    return fromRepoRoot;
  }

  throw new Error(`Arquivo nao encontrado: ${relativeParts.join("/")}`);
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function loadFreightPolicy(): FreightPolicy {
  const filePath = resolvePath(["Docs", "config", "freight-fallback-policy.json"]);
  return readJsonFile<FreightPolicy>(filePath);
}

export function loadImperatrizMatrix(): ImperatrizMatrix {
  const filePath = resolvePath(["Docs", "data", "imperatriz_bairros_matriz.json"]);
  return readJsonFile<ImperatrizMatrix>(filePath);
}

