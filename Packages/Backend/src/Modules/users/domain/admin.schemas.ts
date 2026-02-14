import { z } from "zod";

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["admin", "commerce", "rider"]).optional(),
});

export const adminUserIdParamSchema = z.object({
  userId: z.string().uuid(),
});

export const adminUserStatusUpdateRequestSchema = z.object({
  status: z.enum(["active", "suspended", "blocked"]),
  reason: z.string().trim().min(1),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserStatusUpdateRequest = z.infer<typeof adminUserStatusUpdateRequestSchema>;

