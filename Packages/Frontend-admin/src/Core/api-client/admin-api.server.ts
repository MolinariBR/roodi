import { z } from "zod";

const userRoleSchema = z.enum(["admin", "commerce", "rider"]);
const userStatusSchema = z.enum(["active", "suspended", "blocked"]);
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

type AdminDashboardData = z.infer<typeof adminDashboardSchema>["data"];
type AdminUser = z.infer<typeof adminUserSchema>;
type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;
type AdminOrder = z.infer<typeof orderSchema>;
type AdminOrdersResponse = z.infer<typeof orderListResponseSchema>;
type TrackingTimelineResponse = z.infer<typeof trackingTimelineResponseSchema>;

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type { AdminDashboardData, AdminOrder, AdminOrdersResponse, AdminUser, AdminUsersResponse, TrackingTimelineResponse };

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const resolveApiBaseUrl = (): string | null => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return value ? value : null;
};

const resolveValidationToken = (): string | null => {
  const value = process.env.BACKEND_ADMIN_VALIDATION_TOKEN?.trim();
  return value ? value : null;
};

const requestAdminEndpoint = async <T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<ApiResult<T>> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const validationToken = resolveValidationToken();

  if (!apiBaseUrl || !validationToken) {
    return {
      data: null,
      error: "Configuração ausente: NEXT_PUBLIC_API_BASE_URL ou BACKEND_ADMIN_VALIDATION_TOKEN.",
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
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${validationToken}`,
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Falha de API: ${response.status} ${response.statusText}`,
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
