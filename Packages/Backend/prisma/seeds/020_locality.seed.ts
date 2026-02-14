import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import { loadImperatrizMatrix } from "./_shared/loaders";

const TARGET_BAIRROS: ReadonlyArray<{
  id: string;
  canonicalName: string;
  sourceName: string;
}> = [
  {
    id: seedIds.locality.centro,
    canonicalName: "Centro",
    sourceName: "Centro",
  },
  {
    id: seedIds.locality.vilaLobao,
    canonicalName: "Vila Lobão",
    sourceName: "Vila Lobão",
  },
  {
    // No dataset canônico de Imperatriz nao existe "Sao Jose" isolado.
    // A base oficial usa "Parque Sao Jose" para compor o seed minimo operacional.
    id: seedIds.locality.saoJose,
    canonicalName: "São José",
    sourceName: "Parque São José",
  },
  {
    id: seedIds.locality.bacuri,
    canonicalName: "Bacuri",
    sourceName: "Bacuri",
  },
];

function normalizeBairro(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export async function seedLocality({ prisma }: SeedContext): Promise<void> {
  const matrixData = loadImperatrizMatrix();
  const orderIndexMap = new Map<string, number>();

  matrixData.matrix.order.forEach((name, index) => {
    orderIndexMap.set(name, index);
  });

  for (const bairro of TARGET_BAIRROS) {
    if (!orderIndexMap.has(bairro.sourceName)) {
      throw new Error(
        `Bairro '${bairro.sourceName}' nao encontrado em Docs/data/imperatriz_bairros_matriz.json`,
      );
    }

    await prisma.locality_bairros.upsert({
      where: { id: bairro.id },
      update: {
        city: matrixData.city.name,
        state: matrixData.city.state,
        name: bairro.canonicalName,
        normalized_name: normalizeBairro(bairro.canonicalName),
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

  for (const origin of TARGET_BAIRROS) {
    for (const destination of TARGET_BAIRROS) {
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

      const distanceM = matrixData.matrix.distance_m[originIndex]?.[destinationIndex];
      const durationS = matrixData.matrix.duration_s[originIndex]?.[destinationIndex];

      if (!Number.isFinite(distanceM) || !Number.isFinite(durationS) || distanceM <= 0 || durationS <= 0) {
        throw new Error(
          `Distancia/tempo invalidos para par ${origin.sourceName} -> ${destination.sourceName}`,
        );
      }

      const metadata = {
        source_file: "Docs/data/imperatriz_bairros_matriz.json",
        source_generated_at: matrixData.generated_at,
        source_origin_name: origin.sourceName,
        source_destination_name: destination.sourceName,
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
