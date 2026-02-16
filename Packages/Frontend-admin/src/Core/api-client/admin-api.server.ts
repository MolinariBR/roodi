import { cookies } from "next/headers";
import { z } from "zod";

import { ADMIN_ACCESS_COOKIE_NAME, resolveApiBaseUrl } from "@core/auth/admin-session.shared";
import { readAdminAccessToken } from "@core/auth/admin-session.cookies";

const userRoleSchema = z.enum(["admin", "commerce", "rider"]);
const userStatusSchema = z.enum(["active", "suspended", "blocked"]);
const paymentStatusSchema = z.enum(["pending", "approved", "failed", "canceled"]);
const orderStatusSchema = z.enum([
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
]);

const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  total_pages: z.number().int().min(0),
});

const adminDashboardSchema = z.object({
  success: z.literal(true),
  data: z.object({
    active_orders: z.number().int().min(0),
    completed_today: z.number().int().min(0),
    canceled_today: z.number().int().min(0),
    gross_volume_brl: z.number(),
    platform_commission_brl: z.number(),
  }),
});

const adminUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: userRoleSchema,
    status: userStatusSchema,
  })
  .passthrough();

const adminUsersResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(adminUserSchema),
  pagination: paginationSchema,
});

const orderPriceSchema = z
  .object({
    base_zone_brl: z.number(),
    urgency_brl: z.number(),
    sunday_brl: z.number(),
    holiday_brl: z.number(),
    rain_brl: z.number(),
    peak_brl: z.number(),
    total_brl: z.number(),
  })
  .passthrough();

const orderSchema = z
  .object({
    id: z.string(),
    status: orderStatusSchema,
    total_brl: z.number(),
    created_at: z.string(),
    commerce_id: z.string(),
    rider_id: z.string().optional(),
    urgency: z.enum(["padrao", "urgente", "agendado"]),
    distance_m: z.number().optional(),
    duration_s: z.number().optional(),
    eta_min: z.number().optional(),
    zone: z.number().optional(),
    price: orderPriceSchema,
  })
  .passthrough();

const orderListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(orderSchema),
  pagination: paginationSchema,
});

const orderDetailResponseSchema = orderSchema;

const trackingEventSchema = z
  .object({
    id: z.string(),
    order_id: z.string(),
    event_type: z.string(),
    occurred_at: z.string(),
    actor_role: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();

const trackingTimelineResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(trackingEventSchema),
});

const pricingZoneRuleSchema = z.object({
  zone: z.number().int().min(1),
  min_km: z.number().min(0),
  max_km: z.number().min(0),
  value_brl: z.number().min(0),
});

const pricingRulesSchema = z.object({
  urgency_addon_brl: z.object({
    padrao: z.number().min(0),
    urgente: z.number().min(0),
    agendado: z.number().min(0),
  }),
  conditional_addons_brl: z.object({
    sunday: z.number().min(0),
    holiday: z.number().min(0),
    rain: z.number().min(0),
    peak: z.number().min(0),
  }),
  distance_zones_brl: z.array(pricingZoneRuleSchema).min(1),
  minimum_charge_brl: z.number().min(0),
  max_distance_km: z.number().min(0),
});

const creditsLedgerEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["credit", "debit", "reservation", "release", "adjustment"]),
  amount_brl: z.number(),
  balance_after_brl: z.number(),
  order_id: z.string().optional(),
  reference: z.string().optional(),
  created_at: z.string(),
});

const creditsLedgerListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(creditsLedgerEntrySchema),
  pagination: paginationSchema,
});

const adminCreditAdjustmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    adjustment_id: z.string(),
    commerce_id: z.string(),
    amount_brl: z.number(),
    created_at: z.string(),
  }),
});

const adminPaymentTransactionSchema = z.object({
  id: z.string(),
  provider: z.literal("infinitepay"),
  status: paymentStatusSchema,
  amount_brl: z.number(),
  paid_amount_brl: z.number().optional(),
  order_nsu: z.string().optional(),
  transaction_nsu: z.string().optional(),
  capture_method: z.enum(["pix", "credit_card"]).optional(),
  created_at: z.string(),
});

const adminPaymentTransactionListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(adminPaymentTransactionSchema),
  pagination: paginationSchema,
});

const supportTicketSchema = z
  .object({
    id: z.string(),
    subject: z.string(),
    description: z.string(),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    created_at: z.string(),
    updated_at: z.string().optional(),
    created_by: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: userRoleSchema,
        status: userStatusSchema,
      })
      .optional(),
    assigned_to: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: userRoleSchema,
        status: userStatusSchema,
      })
      .optional(),
  })
  .passthrough();

const supportTicketListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(supportTicketSchema),
  pagination: paginationSchema,
});

const notificationTemplateSchema = z.object({
  id: z.string(),
  event_key: z.string(),
  channel: z.enum(["in_app", "push"]),
  title_template: z.string(),
  body_template: z.string(),
  active: z.boolean(),
});

const notificationTemplateListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(notificationTemplateSchema),
});

const systemFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
});

const systemFlagListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(systemFlagSchema),
});

const systemMaintenanceStatusSchema = z.object({
  enabled: z.boolean(),
  message: z.string(),
  expected_back_at: z.string().optional(),
  updated_at: z.string(),
});

type AdminDashboardData = z.infer<typeof adminDashboardSchema>["data"];
type AdminUser = z.infer<typeof adminUserSchema>;
type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;
type AdminOrder = z.infer<typeof orderSchema>;
type AdminOrdersResponse = z.infer<typeof orderListResponseSchema>;
type TrackingTimelineResponse = z.infer<typeof trackingTimelineResponseSchema>;
type PricingRules = z.infer<typeof pricingRulesSchema>;
type CreditsLedgerListResponse = z.infer<typeof creditsLedgerListResponseSchema>;
type AdminCreditAdjustmentResponse = z.infer<typeof adminCreditAdjustmentResponseSchema>;
type AdminPaymentTransaction = z.infer<typeof adminPaymentTransactionSchema>;
type AdminPaymentTransactionListResponse = z.infer<
  typeof adminPaymentTransactionListResponseSchema
>;
type SupportTicket = z.infer<typeof supportTicketSchema>;
type SupportTicketListResponse = z.infer<typeof supportTicketListResponseSchema>;
type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;
type NotificationTemplateListResponse = z.infer<typeof notificationTemplateListResponseSchema>;
type SystemFlag = z.infer<typeof systemFlagSchema>;
type SystemFlagListResponse = z.infer<typeof systemFlagListResponseSchema>;
type SystemMaintenanceStatus = z.infer<typeof systemMaintenanceStatusSchema>;

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type {
  AdminCreditAdjustmentResponse,
  AdminDashboardData,
  AdminOrder,
  AdminOrdersResponse,
  AdminPaymentTransaction,
  AdminPaymentTransactionListResponse,
  AdminUser,
  AdminUsersResponse,
  CreditsLedgerListResponse,
  NotificationTemplate,
  NotificationTemplateListResponse,
  PricingRules,
  SupportTicket,
  SupportTicketListResponse,
  SystemFlag,
  SystemFlagListResponse,
  SystemMaintenanceStatus,
  TrackingTimelineResponse,
};

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const resolveRequestAccessToken = (): string | null => {
  const tokenFromReader = readAdminAccessToken();
  if (tokenFromReader) {
    return tokenFromReader;
  }

  const tokenFromCookies = cookies().get(ADMIN_ACCESS_COOKIE_NAME)?.value?.trim();
  return tokenFromCookies && tokenFromCookies.length > 0 ? tokenFromCookies : null;
};

const requestAdminEndpoint = async <T>(
  path: string,
  schema: z.ZodType<T>,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH";
    body?: unknown;
  },
): Promise<ApiResult<T>> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const accessToken = resolveRequestAccessToken();

  if (!apiBaseUrl || !accessToken) {
    return {
      data: null,
      error: "Sessao administrativa ausente ou expirada. Faca login novamente.",
    };
  }

  let endpoint: URL;
  try {
    endpoint = new URL(path, apiBaseUrl);
  } catch {
    return {
      data: null,
      error: "NEXT_PUBLIC_API_BASE_URL inválida.",
    };
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: options?.method ?? "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
      },
      ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
    });

    if (!response.ok) {
      let apiMessage: string | undefined;
      try {
        const errorPayload: unknown = await response.json();
        if (
          errorPayload &&
          typeof errorPayload === "object" &&
          "error" in errorPayload &&
          typeof (errorPayload as { error?: unknown }).error === "object" &&
          (errorPayload as { error?: { message?: unknown } }).error?.message &&
          typeof (errorPayload as { error?: { message?: unknown } }).error?.message === "string"
        ) {
          apiMessage = (errorPayload as { error: { message: string } }).error.message;
        }
      } catch {
        apiMessage = undefined;
      }

      return {
        data: null,
        error: apiMessage ?? `Falha de API: ${response.status} ${response.statusText}`,
      };
    }

    const payload: unknown = await response.json();
    const parsedPayload = schema.safeParse(payload);
    if (!parsedPayload.success) {
      return {
        data: null,
        error: "Resposta da API fora do contrato esperado.",
      };
    }

    return {
      data: parsedPayload.data,
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Falha de conexão com backend admin.",
    };
  }
};

export const getAdminDashboard = async (): Promise<ApiResult<AdminDashboardData>> => {
  const result = await requestAdminEndpoint("/v1/admin/dashboard", adminDashboardSchema);
  return {
    data: result.data?.data ?? null,
    error: result.error,
  };
};

export const getAdminUsers = async (input: {
  page?: number;
  limit?: number;
  role?: UserRole;
}): Promise<ApiResult<AdminUsersResponse>> => {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  if (input.role) {
    params.set("role", input.role);
  }

  return requestAdminEndpoint(`/v1/admin/users?${params.toString()}`, adminUsersResponseSchema);
};

export const getAdminOrders = async (input: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}): Promise<ApiResult<AdminOrdersResponse>> => {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  if (input.status) {
    params.set("status", input.status);
  }

  return requestAdminEndpoint(`/v1/admin/orders?${params.toString()}`, orderListResponseSchema);
};

export const getAdminOrder = async (orderId: string): Promise<ApiResult<AdminOrder>> => {
  return requestAdminEndpoint(`/v1/admin/orders/${orderId}`, orderDetailResponseSchema);
};

export const getAdminTracking = async (
  orderId: string,
): Promise<ApiResult<TrackingTimelineResponse>> => {
  return requestAdminEndpoint(
    `/v1/admin/tracking/orders/${orderId}`,
    trackingTimelineResponseSchema,
  );
};

export const getAdminPricingRules = async (): Promise<ApiResult<PricingRules>> => {
  return requestAdminEndpoint("/v1/admin/pricing/rules", pricingRulesSchema);
};

export const updateAdminPricingRules = async (
  payload: PricingRules,
): Promise<ApiResult<PricingRules>> => {
  return requestAdminEndpoint("/v1/admin/pricing/rules", pricingRulesSchema, {
    method: "PUT",
    body: payload,
  });
};

export const getAdminCreditsLedger = async (input: {
  page?: number;
  limit?: number;
}): Promise<ApiResult<CreditsLedgerListResponse>> => {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  return requestAdminEndpoint(
    `/v1/admin/credits/ledger?${params.toString()}`,
    creditsLedgerListResponseSchema,
  );
};

export const createAdminCreditAdjustment = async (payload: {
  commerce_id: string;
  amount_brl: number;
  reason: string;
}): Promise<ApiResult<AdminCreditAdjustmentResponse>> => {
  return requestAdminEndpoint(
    "/v1/admin/credits/adjustments",
    adminCreditAdjustmentResponseSchema,
    {
      method: "POST",
      body: payload,
    },
  );
};

export const getAdminPaymentTransactions = async (input: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}): Promise<ApiResult<AdminPaymentTransactionListResponse>> => {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  if (input.status) {
    params.set("status", input.status);
  }

  return requestAdminEndpoint(
    `/v1/admin/payments/transactions?${params.toString()}`,
    adminPaymentTransactionListResponseSchema,
  );
};

export const getAdminPaymentTransaction = async (
  transactionId: string,
): Promise<ApiResult<AdminPaymentTransaction>> => {
  return requestAdminEndpoint(
    `/v1/admin/payments/transactions/${transactionId}`,
    adminPaymentTransactionSchema,
  );
};

export const getAdminSupportTickets = async (input: {
  page?: number;
  limit?: number;
}): Promise<ApiResult<SupportTicketListResponse>> => {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  return requestAdminEndpoint(
    `/v1/admin/support/tickets?${params.toString()}`,
    supportTicketListResponseSchema,
  );
};

export const updateAdminSupportTicket = async (input: {
  ticketId: string;
  status?: "open" | "in_progress" | "resolved" | "closed";
  note?: string;
  assigned_to_user_id?: string;
}): Promise<ApiResult<SupportTicket>> => {
  return requestAdminEndpoint(`/v1/admin/support/tickets/${input.ticketId}`, supportTicketSchema, {
    method: "PATCH",
    body: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.note ? { note: input.note } : {}),
      ...(input.assigned_to_user_id ? { assigned_to_user_id: input.assigned_to_user_id } : {}),
    },
  });
};

export const getAdminNotificationTemplates = async (): Promise<
  ApiResult<NotificationTemplateListResponse>
> => {
  return requestAdminEndpoint(
    "/v1/admin/notifications/templates",
    notificationTemplateListResponseSchema,
  );
};

export const updateAdminNotificationTemplate = async (input: {
  templateId: string;
  title_template: string;
  body_template: string;
  active: boolean;
}): Promise<ApiResult<NotificationTemplate>> => {
  return requestAdminEndpoint(
    `/v1/admin/notifications/templates/${input.templateId}`,
    notificationTemplateSchema,
    {
      method: "PUT",
      body: {
        title_template: input.title_template,
        body_template: input.body_template,
        active: input.active,
      },
    },
  );
};

export const getAdminSystemFlags = async (): Promise<ApiResult<SystemFlagListResponse>> => {
  return requestAdminEndpoint("/v1/admin/system/flags", systemFlagListResponseSchema);
};

export const updateAdminSystemFlag = async (input: {
  flagKey: string;
  enabled: boolean;
}): Promise<ApiResult<SystemFlag>> => {
  return requestAdminEndpoint(`/v1/admin/system/flags/${input.flagKey}`, systemFlagSchema, {
    method: "PUT",
    body: {
      enabled: input.enabled,
    },
  });
};

export const getAdminSystemMaintenance = async (): Promise<ApiResult<SystemMaintenanceStatus>> => {
  return requestAdminEndpoint(
    "/v1/admin/system/maintenance",
    systemMaintenanceStatusSchema,
  );
};

export const updateAdminSystemMaintenance = async (input: {
  enabled: boolean;
  message: string;
  expected_back_at?: string;
}): Promise<ApiResult<SystemMaintenanceStatus>> => {
  return requestAdminEndpoint(
    "/v1/admin/system/maintenance",
    systemMaintenanceStatusSchema,
    {
      method: "PUT",
      body: {
        enabled: input.enabled,
        message: input.message,
        ...(input.expected_back_at ? { expected_back_at: input.expected_back_at } : {}),
      },
    },
  );
};
