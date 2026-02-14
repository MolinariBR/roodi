import { z } from "zod";

export const systemFlagKeyParamSchema = z.object({
  flagKey: z.string().trim().min(1),
});

export const systemFlagUpdateRequestSchema = z.object({
  enabled: z.boolean(),
});

export const systemMaintenanceUpdateRequestSchema = z.object({
  enabled: z.boolean(),
  message: z.string(),
  expected_back_at: z.coerce.date().optional(),
});

export type SystemFlagUpdateRequest = z.infer<typeof systemFlagUpdateRequestSchema>;
export type SystemMaintenanceUpdateRequest = z.infer<typeof systemMaintenanceUpdateRequestSchema>;

