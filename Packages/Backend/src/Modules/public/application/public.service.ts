import { AppError } from "@core/http/errors/app-error";
import type { LegalDocumentType, PublicLeadRequest } from "@modules/public/domain/public.schemas";
import { PublicRepository } from "@modules/public/infra/public.repository";

export class PublicService {
  constructor(private readonly publicRepository = new PublicRepository()) {}

  public async createLead(input: {
    payload: PublicLeadRequest;
    source?: string;
  }): Promise<{
    success: true;
    data: {
      lead_id: string;
      created_at: string;
    };
  }> {
    const lead = await this.publicRepository.createPublicLead({
      payload: input.payload,
      source: input.source,
    });

    return {
      success: true,
      data: {
        lead_id: lead.id,
        created_at: lead.created_at.toISOString(),
      },
    };
  }

  public async getLegalDocument(
    documentType: LegalDocumentType,
  ): Promise<{
    success: true;
    data: {
      type: LegalDocumentType;
      version: string;
      updated_at: string;
      content: string;
    };
  }> {
    const legalDocument = await this.publicRepository.findLatestActiveLegalDocument(documentType);

    if (!legalDocument) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Legal document not found.",
        statusCode: 404,
      });
    }

    return {
      success: true,
      data: {
        type: legalDocument.doc_type as LegalDocumentType,
        version: legalDocument.version,
        updated_at: legalDocument.updated_at.toISOString(),
        content: legalDocument.content,
      },
    };
  }
}
