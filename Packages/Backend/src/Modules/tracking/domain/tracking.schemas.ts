import { z } from "zod";

export const riderOrderEventRequestSchema = z.object({
  event_type: z.enum([
    "order_created",
    "rider_assigned",
    "rider_accepted",
    "rider_to_merchant",
    "rider_at_merchant",
    "waiting_order",
    "rider_to_customer",
    "rider_at_customer",
    "finishing_delivery",
    "completed",
    "canceled",
  ]),
  occurred_at: z.coerce.date(),
  note: z.string().trim().max(500).optional(),
});

export type RiderOrderEventRequest = z.infer<typeof riderOrderEventRequestSchema>;
