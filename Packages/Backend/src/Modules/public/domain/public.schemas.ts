import { z } from "zod";

export const publicLeadTypeSchema = z.enum(["commerce", "rider", "partnership", "other"]);

export const publicLeadRequestSchema = z.object({
  name: z.string().trim().min(1).max(160),
  contact: z.string().trim().min(1).max(180),
  lead_type: publicLeadTypeSchema,
  message: z.string().trim().max(4000).optional(),
});

export const legalDocumentTypeSchema = z.enum(["termos", "privacidade", "cookies"]);

export const legalDocumentTypeParamSchema = z.object({
  documentType: legalDocumentTypeSchema,
});

export type PublicLeadRequest = z.infer<typeof publicLeadRequestSchema>;
export type LegalDocumentType = z.infer<typeof legalDocumentTypeSchema>;
