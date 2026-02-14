import type {
  locality_bairro_matrix,
  locality_bairros,
  PrismaClient,
} from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";

export class LocalityRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findActiveBairroByNormalizedName(
    normalizedName: string,
  ): Promise<locality_bairros | null> {
    return this.prismaClient.locality_bairros.findFirst({
      where: {
        normalized_name: normalizedName,
        is_active: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });
  }

  public findMatrixByBairros(
    originBairroId: string,
    destinationBairroId: string,
  ): Promise<locality_bairro_matrix | null> {
    return this.prismaClient.locality_bairro_matrix.findUnique({
      where: {
        origin_bairro_id_destination_bairro_id: {
          origin_bairro_id: originBairroId,
          destination_bairro_id: destinationBairroId,
        },
      },
    });
  }
}
