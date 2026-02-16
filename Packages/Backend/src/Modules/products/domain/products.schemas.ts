import { z } from "zod";

const productStatusSchema = z.enum(["active", "paused", "hidden"]);

export const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: productStatusSchema.optional(),
});

export const productUpsertRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  price_brl: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional(),
});

export const productStatusUpdateRequestSchema = z.object({
  status: productStatusSchema,
});

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductUpsertRequest = z.infer<typeof productUpsertRequestSchema>;
export type ProductStatusUpdateRequest = z.infer<typeof productStatusUpdateRequestSchema>;
