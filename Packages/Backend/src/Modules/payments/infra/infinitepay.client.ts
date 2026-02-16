import { z } from "zod";

import { env } from "@core/config/env";
import { AppError } from "@core/http/errors/app-error";
import { logger } from "@core/observability/logger";

type CreateCheckoutLinkInput = {
  handle: string;
  amountCents: number;
  orderNsu: string;
  description?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  customer?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  address?: {
    cep?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
    street?: string;
    number?: string;
    complement?: string;
  };
};

type PaymentCheckInput = {
  handle: string;
  orderNsu: string;
  transactionNsu: string;
  slug: string;
};

const paymentCheckProviderResponseSchema = z.object({
  success: z.boolean(),
  paid: z.boolean(),
  amount: z.coerce.number().int(),
  paid_amount: z.coerce.number().int(),
  installments: z.coerce.number().int(),
  capture_method: z.enum(["pix", "credit_card"]),
});

type PaymentCheckProviderResponse = z.infer<typeof paymentCheckProviderResponseSchema>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readStringFromPath = (
  payload: Record<string, unknown>,
  path: readonly string[],
): string | undefined => {
  let cursor: unknown = payload;

  for (const key of path) {
    if (!isObjectRecord(cursor)) {
      return undefined;
    }

    cursor = cursor[key];
  }

  return typeof cursor === "string" && cursor.trim().length > 0 ? cursor : undefined;
};

const resolveCheckoutUrl = (payload: Record<string, unknown>): string | undefined => {
  const candidates: ReadonlyArray<readonly string[]> = [
    ["checkout_url"],
    ["url"],
    ["link"],
    ["invoice_url"],
    ["redirect_url"],
    ["data", "checkout_url"],
    ["data", "url"],
    ["data", "link"],
    ["data", "redirect_url"],
  ];

  for (const candidatePath of candidates) {
    const value = readStringFromPath(payload, candidatePath);
    if (value) {
      return value;
    }
  }

  return undefined;
};

export class InfinitePayClient {
  constructor(
    private readonly baseUrl = env.infinitePayApiBaseUrl.replace(/\/+$/, ""),
    private readonly apiKey = env.infinitePayApiKey,
    private readonly requestTimeoutMs = env.requestTimeoutMs,
  ) {}

  private async postJson(
    endpoint: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number; data: Record<string, unknown> }> {
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.requestTimeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      const responsePayload = (await response.json().catch(() => ({}))) as unknown;
      if (!isObjectRecord(responsePayload)) {
        throw new AppError({
          code: "SERVICE_UNAVAILABLE",
          message: "InfinitePay returned an invalid response payload.",
          statusCode: 503,
        });
      }

      return {
        status: response.status,
        data: responsePayload,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError({
          code: "SERVICE_UNAVAILABLE",
          message: "InfinitePay request timed out.",
          statusCode: 503,
        });
      }

      logger.error(
        {
          endpoint,
          error,
        },
        "infinitepay_request_failed",
      );

      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "Unable to communicate with InfinitePay.",
        statusCode: 503,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  public async createCheckoutLink(input: CreateCheckoutLinkInput): Promise<{
    checkoutUrl: string;
    providerPayload: Record<string, unknown>;
  }> {
    const itemDescription = input.description?.trim().length
      ? input.description.trim()
      : "Recarga de creditos Roodi";

    const requestPayload = {
      handle: input.handle,
      itens: [
        {
          quantity: 1,
          price: input.amountCents,
          description: itemDescription,
        },
      ],
      order_nsu: input.orderNsu,
      ...(input.redirectUrl ? { redirect_url: input.redirectUrl } : {}),
      ...(input.webhookUrl ? { webhook_url: input.webhookUrl } : {}),
      ...(input.customer ? { customer: input.customer } : {}),
      ...(input.address ? { address: input.address } : {}),
    } satisfies Record<string, unknown>;

    const response = await this.postJson("/invoices/public/checkout/links", requestPayload);
    if (response.status < 200 || response.status >= 300) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay refused checkout creation.",
        statusCode: 503,
        details: {
          provider_status: response.status,
        },
      });
    }

    const checkoutUrl = resolveCheckoutUrl(response.data);
    if (!checkoutUrl) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay did not provide checkout URL.",
        statusCode: 503,
      });
    }

    return {
      checkoutUrl,
      providerPayload: response.data,
    };
  }

  public async checkPaymentStatus(input: PaymentCheckInput): Promise<{
    result: PaymentCheckProviderResponse;
    providerPayload: Record<string, unknown>;
  }> {
    const requestPayload = {
      handle: input.handle,
      order_nsu: input.orderNsu,
      transaction_nsu: input.transactionNsu,
      slug: input.slug,
    } satisfies Record<string, unknown>;

    const response = await this.postJson(
      "/invoices/public/checkout/payment_check",
      requestPayload,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay payment check is currently unavailable.",
        statusCode: 503,
        details: {
          provider_status: response.status,
        },
      });
    }

    const parsedPayload = paymentCheckProviderResponseSchema.safeParse(response.data);
    if (!parsedPayload.success) {
      throw new AppError({
        code: "SERVICE_UNAVAILABLE",
        message: "InfinitePay payment check returned invalid payload.",
        statusCode: 503,
      });
    }

    return {
      result: parsedPayload.data,
      providerPayload: response.data,
    };
  }
}
