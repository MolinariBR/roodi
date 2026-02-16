import { z } from "zod";

const addressSchema = z.object({
  cep: z.string().trim().max(20).optional(),
  state: z.string().trim().max(64).optional(),
  city: z.string().trim().max(128).optional(),
  neighborhood: z.string().trim().max(128).optional(),
  street: z.string().trim().max(128).optional(),
  number: z.string().trim().max(32).optional(),
  complement: z.string().trim().max(128).optional(),
});

const customerSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone_number: z.string().trim().min(1).max(40).optional(),
});

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid(),
});

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid(),
});

export const transactionIdParamSchema = z.object({
  transactionId: z.string().uuid(),
});

export const adminPaymentTransactionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "failed", "canceled"]).optional(),
});

export const createCreditPurchaseIntentRequestSchema = z.object({
  amount_brl: z.coerce.number().min(1),
  redirect_url: z.string().trim().url().optional(),
  webhook_url: z.string().trim().url().optional(),
});

export const createOrderPaymentIntentRequestSchema = z.object({
  redirect_url: z.string().trim().url().optional(),
  webhook_url: z.string().trim().url().optional(),
  customer: customerSchema.optional(),
  address: addressSchema.optional(),
});

export const paymentCheckRequestSchema = z.object({
  handle: z.string().trim().min(1),
  order_nsu: z.string().trim().min(1),
  transaction_nsu: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

export const infinitePayWebhookPayloadSchema = z.object({
  invoice_slug: z.string().trim().min(1),
  amount: z.coerce.number().int().positive(),
  paid_amount: z.coerce.number().int().positive(),
  installments: z.coerce.number().int().min(1),
  capture_method: z.enum(["pix", "credit_card"]),
  transaction_nsu: z.string().trim().min(1),
  order_nsu: z.string().trim().min(1),
  receipt_url: z.string().trim().url(),
  items: z.array(z.record(z.unknown())),
});

export type CreateCreditPurchaseIntentRequest = z.infer<
  typeof createCreditPurchaseIntentRequestSchema
>;
export type CreateOrderPaymentIntentRequest = z.infer<
  typeof createOrderPaymentIntentRequestSchema
>;
export type PaymentCheckRequest = z.infer<typeof paymentCheckRequestSchema>;
export type InfinitePayWebhookPayload = z.infer<typeof infinitePayWebhookPayloadSchema>;
export type AdminPaymentTransactionListQuery = z.infer<typeof adminPaymentTransactionListQuerySchema>;
