import { z } from "zod";

export const offerIdParamSchema = z.object({
  offerId: z.string().uuid(),
});

export const rejectOfferRequestSchema = z
  .object({
    reason: z.string().trim().min(1).max(200).optional(),
  })
  .optional();

export const riderAvailabilityRequestSchema = z.object({
  status: z.enum(["online", "offline"]),
});

export type RejectOfferRequest = z.infer<typeof rejectOfferRequestSchema>;
export type RiderAvailabilityRequest = z.infer<typeof riderAvailabilityRequestSchema>;
