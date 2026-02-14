import { z } from "zod";

export const supportTicketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const supportTicketIdParamSchema = z.object({
  ticketId: z.string().uuid(),
});

export const supportTicketCreateRequestSchema = z.object({
  subject: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  order_id: z.string().uuid().optional(),
});

export type SupportTicketListQuery = z.infer<typeof supportTicketListQuerySchema>;
export type SupportTicketCreateRequest = z.infer<typeof supportTicketCreateRequestSchema>;

export const adminSupportTicketUpdateRequestSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  note: z.string().trim().min(1).optional(),
  assigned_to_user_id: z.string().uuid().optional(),
});

export type AdminSupportTicketUpdateRequest = z.infer<typeof adminSupportTicketUpdateRequestSchema>;
