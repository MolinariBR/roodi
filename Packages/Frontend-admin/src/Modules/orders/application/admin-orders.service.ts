import {
  getAdminOrder,
  getAdminOrders,
  type AdminOrder,
  type OrderStatus,
} from "@core/api-client/admin-api.server";

type ListAdminOrdersInput = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export type AdminOrdersResult = {
  data: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  error: string | null;
};

export const listAdminOrders = async (
  input: ListAdminOrdersInput,
): Promise<AdminOrdersResult> => {
  const result = await getAdminOrders(input);
  if (!result.data) {
    return {
      data: [],
      pagination: null,
      error: result.error,
    };
  }

  return {
    data: result.data.data,
    pagination: result.data.pagination,
    error: null,
  };
};

export const getAdminOrderById = async (
  orderId: string,
): Promise<{ data: AdminOrder | null; error: string | null }> => {
  return getAdminOrder(orderId);
};
