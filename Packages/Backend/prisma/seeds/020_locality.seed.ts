import crypto from "node:crypto";

import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import { loadImperatrizMatrix } from "./_shared/loaders";

const FIXED_BAIRRO_IDS: Readonly<Record<string, string>> = {
  [normalizeBairro("Centro")]: seedIds.locality.centro,
  [normalizeBairro("Vila Lobão")]: seedIds.locality.vilaLobao,
  [normalizeBairro("Bacuri")]: seedIds.locality.bacuri,
  [normalizeBairro("Parque São José")]: seedIds.locality.saoJose,
  [normalizeBairro("São José")]: seedIds.locality.saoJose,
};

const ALIAS_CANONICAL_NAME: Readonly<Record<string, string>> = {
  [normalizeBairro("Parque São José")]: "São José",
};

function normalizeBairro(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function deterministicUuidFromKey(key: string): string {
  const digest = crypto
    .createHash("sha1")
    .update(`roodi:locality:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");

  digest[12] = "5";
  const variantNibble = parseInt(digest[16], 16);
  digest[16] = ((variantNibble & 0x3) | 0x8).toString(16);

  const hex = digest.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

type LocalitySeedBairro = {
  id: string;
  sourceName: string;
  canonicalName: string;
  normalizedCanonicalName: string;
};

const EARTH_RADIUS_M = 6_371_000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineDistanceM(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
): number {
  const latitudeDelta = toRadians(destination.lat - origin.lat);
  const longitudeDelta = toRadians(destination.lon - origin.lon);

  const originLatitude = toRadians(origin.lat);
  const destinationLatitude = toRadians(destination.lat);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value) && Number(value) > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value);
}

function median(values: readonly number[], fallback: number): number {
  if (values.length === 0) {
    return fallback;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
  }

  return sorted[middleIndex];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export async function seedLocality({ prisma }: SeedContext): Promise<void> {
  const matrixData = loadImperatrizMatrix();
  const orderIndexMap = new Map<string, number>();

  matrixData.matrix.order.forEach((name, index) => {
    orderIndexMap.set(name, index);
  });

  const bairrosToSeed: LocalitySeedBairro[] = matrixData.matrix.order.map(
    (sourceName) => {
      const normalizedSourceName = normalizeBairro(sourceName);
      const canonicalName =
        ALIAS_CANONICAL_NAME[normalizedSourceName] ?? sourceName;
      const normalizedCanonicalName = normalizeBairro(canonicalName);

      const id =
        FIXED_BAIRRO_IDS[normalizedSourceName] ??
        deterministicUuidFromKey(
          `${matrixData.city.name}|${matrixData.city.state}|${normalizedCanonicalName}`,
        );

      return {
        id,
        sourceName,
        canonicalName,
        normalizedCanonicalName,
      };
    },
  );

  const geolocationBySourceName = new Map<
    string,
    { lat: number; lon: number }
  >(
    matrixData.bairros
      .filter(
        (bairro) =>
          isFiniteNumber(bairro.lat) &&
          isFiniteNumber(bairro.lon),
      )
      .map((bairro) => [bairro.name, { lat: bairro.lat!, lon: bairro.lon! }]),
  );

  const routeFactorSamples: number[] = [];
  const secondsPerMeterSamples: number[] = [];

  for (let originIndex = 0; originIndex < matrixData.matrix.order.length; originIndex += 1) {
    for (
      let destinationIndex = 0;
      destinationIndex < matrixData.matrix.order.length;
      destinationIndex += 1
    ) {
      if (originIndex === destinationIndex) {
        continue;
      }

      const distanceM = matrixData.matrix.distance_m[originIndex]?.[destinationIndex];
      const durationS = matrixData.matrix.duration_s[originIndex]?.[destinationIndex];

      if (!isPositiveFiniteNumber(distanceM) || !isPositiveFiniteNumber(durationS)) {
        continue;
      }

      const originGeo = geolocationBySourceName.get(
        matrixData.matrix.order[originIndex],
      );
      const destinationGeo = geolocationBySourceName.get(
        matrixData.matrix.order[destinationIndex],
      );

      if (!originGeo || !destinationGeo) {
        continue;
      }

      const geodesicM = haversineDistanceM(originGeo, destinationGeo);
      if (geodesicM > 0) {
        routeFactorSamples.push(distanceM / geodesicM);
      }

      secondsPerMeterSamples.push(durationS / distanceM);
    }
  }

  const calibratedRouteFactor = clamp(median(routeFactorSamples, 1.35), 1.05, 3.5);
  const calibratedSecondsPerMeter = clamp(
    median(secondsPerMeterSamples, 0.13),
    0.03,
    0.9,
  );

  for (const bairro of bairrosToSeed) {
    await prisma.locality_bairros.upsert({
      where: { id: bairro.id },
      update: {
        city: matrixData.city.name,
        state: matrixData.city.state,
        name: bairro.canonicalName,
        normalized_name: bairro.normalizedCanonicalName,
        is_active: true,
      },
      create: {
        id: bairro.id,
        city: matrixData.city.name,
        state: matrixData.city.state,
        name: bairro.canonicalName,
        normalized_name: normalizeBairro(bairro.canonicalName),
        is_active: true,
      },
    });
  }

  const pairUpsertQuery = `
    INSERT INTO locality_bairro_matrix (
      origin_bairro_id,
      destination_bairro_id,
      distance_m,
      duration_s,
      source_provider,
      source_metadata
    )
    VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::jsonb)
    ON CONFLICT (origin_bairro_id, destination_bairro_id)
    DO UPDATE SET
      distance_m = EXCLUDED.distance_m,
      duration_s = EXCLUDED.duration_s,
      source_provider = EXCLUDED.source_provider,
      source_metadata = EXCLUDED.source_metadata,
      updated_at = now()
  `;

  for (const origin of bairrosToSeed) {
    for (const destination of bairrosToSeed) {
      if (origin.id === destination.id) {
        continue;
      }

      const originIndex = orderIndexMap.get(origin.sourceName);
      const destinationIndex = orderIndexMap.get(destination.sourceName);

      if (originIndex == null || destinationIndex == null) {
        throw new Error(
          `Indices nao encontrados para par ${origin.sourceName} -> ${destination.sourceName}`,
        );
      }

      let distanceM = matrixData.matrix.distance_m[originIndex]?.[destinationIndex];
      let durationS = matrixData.matrix.duration_s[originIndex]?.[destinationIndex];
      let metricSource = "matrix";

      if (!isPositiveFiniteNumber(distanceM) || !isPositiveFiniteNumber(durationS)) {
        const originGeo = geolocationBySourceName.get(origin.sourceName);
        const destinationGeo = geolocationBySourceName.get(destination.sourceName);

        if (!originGeo || !destinationGeo) {
          throw new Error(
            `Geolocalizacao ausente para estimativa de par ${origin.sourceName} -> ${destination.sourceName}`,
          );
        }

        const geodesicM = haversineDistanceM(originGeo, destinationGeo);
        const estimatedDistanceM = Math.max(
          250,
          Math.round(geodesicM * calibratedRouteFactor),
        );
        const estimatedDurationS = Math.max(
          90,
          Math.round(estimatedDistanceM * calibratedSecondsPerMeter),
        );

        distanceM = estimatedDistanceM;
        durationS = estimatedDurationS;
        metricSource = "estimated_from_geodesic";
      }

      if (!isPositiveFiniteNumber(distanceM) || !isPositiveFiniteNumber(durationS)) {
        throw new Error(
          `Distancia/tempo invalidos para par ${origin.sourceName} -> ${destination.sourceName}`,
        );
      }

      const metadata = {
        source_file: "Docs/data/imperatriz_bairros_matriz.json",
        source_generated_at: matrixData.generated_at,
        source_city: matrixData.city.name,
        source_state: matrixData.city.state,
        source_origin_name: origin.sourceName,
        source_destination_name: destination.sourceName,
        metric_source: metricSource,
        calibration: {
          route_factor: calibratedRouteFactor,
          seconds_per_meter: calibratedSecondsPerMeter,
        },
      };

      await prisma.$executeRawUnsafe(
        pairUpsertQuery,
        origin.id,
        destination.id,
        Math.round(distanceM),
        Math.round(durationS),
        "local_bairro_matrix",
        JSON.stringify(metadata),
      );
    }
  }
}
