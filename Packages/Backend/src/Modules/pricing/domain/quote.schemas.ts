import { z } from "zod";

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .or(
    z.string().refine((value) => {
      return !Number.isNaN(Date.parse(value));
    }),
  );

export const quoteRequestSchema = z.object({
  origin_bairro: z.string().trim().min(1),
  destination_bairro: z.string().trim().min(1),
  urgency: z.enum(["padrao", "urgente", "agendado"]),
  requested_at_iso: isoDateTimeSchema,
  is_holiday: z.boolean().optional(),
  is_sunday: z.boolean().optional(),
  is_peak: z.boolean().optional(),
  order_id: z.string().uuid().optional(),
  commerce_id: z.string().uuid().optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
