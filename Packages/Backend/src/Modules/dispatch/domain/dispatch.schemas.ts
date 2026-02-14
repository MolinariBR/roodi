import { z } from "zod";

export const offerIdParamSchema = z.object({
  offerId: z.string().uuid(),
});

export const rejectOfferRequestSchema = z
  .object({
    reason: z.string().trim().min(1).max(200).optional(),
  })
  .optional();

export type RejectOfferRequest = z.infer<typeof rejectOfferRequestSchema>;
