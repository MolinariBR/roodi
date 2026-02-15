import {
  getAdminPaymentTransaction,
  getAdminPaymentTransactions,
  type AdminPaymentTransaction,
  type AdminPaymentTransactionListResponse,
  type PaymentStatus,
} from "@core/api-client/admin-api.server";

export const loadAdminPaymentTransactions = async (input: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}): Promise<{ data: AdminPaymentTransactionListResponse | null; error: string | null }> => {
  return getAdminPaymentTransactions(input);
};

export const loadAdminPaymentTransaction = async (
  transactionId: string,
): Promise<{ data: AdminPaymentTransaction | null; error: string | null }> => {
  return getAdminPaymentTransaction(transactionId);
};
