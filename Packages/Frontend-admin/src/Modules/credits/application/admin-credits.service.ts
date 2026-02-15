import {
  createAdminCreditAdjustment,
  getAdminCreditsLedger,
  type CreditsLedgerListResponse,
} from "@core/api-client/admin-api.server";

export const loadAdminCreditsLedger = async (input: {
  page?: number;
  limit?: number;
}): Promise<{ data: CreditsLedgerListResponse | null; error: string | null }> => {
  return getAdminCreditsLedger(input);
};

export const createCreditsAdjustment = async (payload: {
  commerce_id: string;
  amount_brl: number;
  reason: string;
}): Promise<{
  data: {
    adjustment_id: string;
    commerce_id: string;
    amount_brl: number;
    created_at: string;
  } | null;
  error: string | null;
}> => {
  const result = await createAdminCreditAdjustment(payload);
  return {
    data: result.data?.data ?? null,
    error: result.error,
  };
};
