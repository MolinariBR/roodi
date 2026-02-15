import {
  getAdminUsers,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@core/api-client/admin-api.server";

type ListAdminUsersInput = {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
};

export type AdminUsersResult = {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  error: string | null;
};

export const listAdminUsers = async (
  input: ListAdminUsersInput,
): Promise<AdminUsersResult> => {
  const result = await getAdminUsers({
    page: input.page,
    limit: input.limit,
    role: input.role,
  });

  if (!result.data) {
    return {
      data: [],
      pagination: null,
      error: result.error,
    };
  }

  const filteredData = input.status
    ? result.data.data.filter((user) => user.status === input.status)
    : result.data.data;

  return {
    data: filteredData,
    pagination: result.data.pagination,
    error: result.error,
  };
};
