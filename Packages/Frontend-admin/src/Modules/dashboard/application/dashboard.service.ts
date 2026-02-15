import { getAdminDashboard, type AdminDashboardData } from "@core/api-client/admin-api.server";

export type DashboardResult = {
  data: AdminDashboardData | null;
  error: string | null;
};

export const loadDashboard = async (): Promise<DashboardResult> => {
  return getAdminDashboard();
};
