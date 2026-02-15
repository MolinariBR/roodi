import {
  getAdminSupportTickets,
  updateAdminSupportTicket,
  type SupportTicket,
  type SupportTicketListResponse,
} from "@core/api-client/admin-api.server";

export const loadAdminSupportTickets = async (input: {
  page?: number;
  limit?: number;
}): Promise<{ data: SupportTicketListResponse | null; error: string | null }> => {
  return getAdminSupportTickets(input);
};

export const saveAdminSupportTicket = async (input: {
  ticketId: string;
  status?: "open" | "in_progress" | "resolved" | "closed";
  note?: string;
  assigned_to_user_id?: string;
}): Promise<{ data: SupportTicket | null; error: string | null }> => {
  return updateAdminSupportTicket(input);
};
