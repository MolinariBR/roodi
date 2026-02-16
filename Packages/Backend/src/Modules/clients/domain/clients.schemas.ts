import { z } from "zod";

const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .optional();

export const clientIdParamSchema = z.object({
  clientId: z.string().uuid(),
});

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(120).optional(),
});

export const clientAddressSchema = z.object({
  cep: z.string().trim().min(1).max(20).optional(),
  state: z.string().trim().min(1).max(64).optional(),
  city: z.string().trim().min(1).max(128).optional(),
  neighborhood: z.string().trim().min(1).max(128).optional(),
  street: z.string().trim().min(1).max(128).optional(),
  number: z.string().trim().min(1).max(32).optional(),
  complement: z.string().trim().min(1).max(128).optional(),
});

export const clientUpsertRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone_number: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(255).optional(),
  address: clientAddressSchema,
  notes: nullableTrimmedStringSchema,
});

export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
export type ClientAddressInput = z.infer<typeof clientAddressSchema>;
export type ClientUpsertRequest = z.infer<typeof clientUpsertRequestSchema>;
