import type { NextFunction, Request, Response } from "express";

import { PublicService } from "@modules/public/application/public.service";
import {
  legalDocumentTypeParamSchema,
  publicLeadRequestSchema,
} from "@modules/public/domain/public.schemas";

const resolveLeadSource = (req: Request): string | undefined => {
  const explicitSource = req.header("x-lead-source");
  if (explicitSource) {
    return explicitSource;
  }

  const origin = req.header("origin");
  if (origin) {
    return origin;
  }

  const referer = req.header("referer");
  return referer ?? undefined;
};

export class PublicController {
  constructor(private readonly publicService = new PublicService()) {}

  public createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = publicLeadRequestSchema.parse(req.body);
      const responseBody = await this.publicService.createLead({
        payload,
        source: resolveLeadSource(req),
      });

      res.locals.auditEntityId = responseBody.data.lead_id;
      res.status(201).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };

  public getLegalDocument = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params = legalDocumentTypeParamSchema.parse(req.params);
      const responseBody = await this.publicService.getLegalDocument(params.documentType);

      res.status(200).json(responseBody);
    } catch (error: unknown) {
      next(error);
    }
  };
}
