import { z } from "zod";

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["all", "unread", "read"]).default("all"),
});

export const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid(),
});

export const templateIdParamSchema = z.object({
  templateId: z.string().uuid(),
});

export const notificationTemplateUpdateRequestSchema = z.object({
  title_template: z.string(),
  body_template: z.string(),
  active: z.boolean(),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type NotificationTemplateUpdateRequest = z.infer<typeof notificationTemplateUpdateRequestSchema>;
