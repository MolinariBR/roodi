import { z } from "zod";

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "created",
      "searching_rider",
      "rider_assigned",
      "to_merchant",
      "at_merchant",
      "waiting_order",
      "to_customer",
      "at_customer",
      "finishing_delivery",
      "completed",
      "canceled",
    ])
    .optional(),
});

export const addressSchema = z.object({
  cep: z.string().trim().max(20).optional(),
  state: z.string().trim().max(64).optional(),
  city: z.string().trim().max(128).optional(),
  neighborhood: z.string().trim().max(128).optional(),
  street: z.string().trim().max(128).optional(),
  number: z.string().trim().max(32).optional(),
  complement: z.string().trim().max(128).optional(),
});

export const createOrderRequestSchema = z.object({
  quote_id: z.string().uuid(),
  urgency: z.enum(["padrao", "urgente", "agendado"]),
  client_id: z.string().uuid().optional(),
  destination: addressSchema,
  recipient_name: z.string().trim().min(1).max(120).optional(),
  recipient_phone: z.string().trim().min(1).max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const cancelOrderRequestSchema = z.object({
  reason: z.string().trim().min(1).max(200),
  details: z.string().trim().max(500).optional(),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type CancelOrderRequest = z.infer<typeof cancelOrderRequestSchema>;
