import { z } from "zod";

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid(),
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
export type PaymentCheckRequest = z.infer<typeof paymentCheckRequestSchema>;
export type InfinitePayWebhookPayload = z.infer<typeof infinitePayWebhookPayloadSchema>;
export type AdminPaymentTransactionListQuery = z.infer<typeof adminPaymentTransactionListQuerySchema>;
