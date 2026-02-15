import {
  getAdminPricingRules,
  updateAdminPricingRules,
  type PricingRules,
} from "@core/api-client/admin-api.server";

export const loadPricingRules = async (): Promise<{
  data: PricingRules | null;
  error: string | null;
}> => {
  return getAdminPricingRules();
};

export const savePricingRules = async (
  payload: PricingRules,
): Promise<{ data: PricingRules | null; error: string | null }> => {
  return updateAdminPricingRules(payload);
};
