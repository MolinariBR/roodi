import {
  getAdminSystemFlags,
  getAdminSystemMaintenance,
  updateAdminSystemFlag,
  updateAdminSystemMaintenance,
  type SystemFlag,
  type SystemFlagListResponse,
  type SystemMaintenanceStatus,
} from "@core/api-client/admin-api.server";

export const loadSystemFlags = async (): Promise<{
  data: SystemFlagListResponse | null;
  error: string | null;
}> => {
  return getAdminSystemFlags();
};

export const saveSystemFlag = async (input: {
  flagKey: string;
  enabled: boolean;
}): Promise<{ data: SystemFlag | null; error: string | null }> => {
  return updateAdminSystemFlag(input);
};

export const loadSystemMaintenance = async (): Promise<{
  data: SystemMaintenanceStatus | null;
  error: string | null;
}> => {
  return getAdminSystemMaintenance();
};

export const saveSystemMaintenance = async (input: {
  enabled: boolean;
  message: string;
  expected_back_at?: string;
}): Promise<{ data: SystemMaintenanceStatus | null; error: string | null }> => {
  return updateAdminSystemMaintenance(input);
};
