import { z } from "zod";

export const creditsLedgerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminCreditAdjustmentRequestSchema = z.object({
  commerce_id: z.string().uuid(),
  amount_brl: z
    .coerce
    .number()
    .refine((value) => Number.isFinite(value), "Invalid number")
    .refine((value) => value !== 0, "amount_brl must not be zero"),
  reason: z.string().trim().min(1),
});

export type CreditsLedgerQuery = z.infer<typeof creditsLedgerQuerySchema>;
export type AdminCreditAdjustmentRequest = z.infer<typeof adminCreditAdjustmentRequestSchema>;
