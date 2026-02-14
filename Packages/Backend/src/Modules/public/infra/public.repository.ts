import type { PrismaClient, legal_documents } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { LegalDocumentType, PublicLeadRequest } from "@modules/public/domain/public.schemas";

type CreatePublicLeadInput = {
  payload: PublicLeadRequest;
  source?: string;
};

export class PublicRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public createPublicLead(input: CreatePublicLeadInput): Promise<{
    id: string;
    created_at: Date;
  }> {
    return this.prismaClient.public_leads.create({
      data: {
        lead_type: input.payload.lead_type,
        name: input.payload.name,
        contact: input.payload.contact,
        message: input.payload.message,
        source: input.source,
      },
      select: {
        id: true,
        created_at: true,
      },
    });
  }

  public findLatestActiveLegalDocument(
    documentType: LegalDocumentType,
  ): Promise<legal_documents | null> {
    return this.prismaClient.legal_documents.findFirst({
      where: {
        doc_type: documentType,
        is_active: true,
      },
      orderBy: [
        {
          updated_at: "desc",
        },
        {
          created_at: "desc",
        },
      ],
    });
  }
}
