import type { support_faqs, users } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type {
  AdminSupportTicketUpdateRequest,
  SupportTicketCreateRequest,
  SupportTicketListQuery,
} from "@modules/support/domain/support.schemas";
import type { SupportTicketWithUsers } from "@modules/support/infra/support.repository";
import { SupportRepository } from "@modules/support/infra/support.repository";

type UserSummary = Pick<users, "id" | "name" | "email" | "role" | "status">;

const toUserSummary = (user: UserSummary | null | undefined): Record<string, string> | undefined => {
  if (!user) {
    return undefined;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

const toFaqItem = (faq: support_faqs): Record<string, unknown> => {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  };
};

const toSupportTicket = (ticket: SupportTicketWithUsers): Record<string, unknown> => {
  return {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    created_at: ticket.created_at.toISOString(),
    updated_at: ticket.updated_at.toISOString(),
    ...(toUserSummary(ticket.users_support_tickets_created_by_user_idTousers)
      ? { created_by: toUserSummary(ticket.users_support_tickets_created_by_user_idTousers) }
      : {}),
    ...(toUserSummary(ticket.users_support_tickets_assigned_to_user_idTousers)
      ? { assigned_to: toUserSummary(ticket.users_support_tickets_assigned_to_user_idTousers) }
      : {}),
  };
};

export class SupportService {
  constructor(private readonly supportRepository = new SupportRepository()) {}

  public async listFaqs(): Promise<{ success: true; data: Record<string, unknown>[] }> {
    const faqs = await this.supportRepository.listActiveFaqs();

    return {
      success: true,
      data: faqs.map(toFaqItem),
    };
  }

  public async listSupportTickets(
    userId: string,
    query: SupportTicketListQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const { items, total } = await this.supportRepository.listTicketsByUser(userId, query);

    return {
      success: true,
      data: items.map(toSupportTicket),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async listAdminSupportTickets(
    query: SupportTicketListQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const { items, total } = await this.supportRepository.listTicketsAdmin(query);

    return {
      success: true,
      data: items.map(toSupportTicket),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async createSupportTicket(
    userId: string,
    payload: SupportTicketCreateRequest,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.supportRepository.createTicket({
      userId,
      payload,
    });

    return toSupportTicket(ticket);
  }

  public async getSupportTicket(
    userId: string,
    ticketId: string,
  ): Promise<Record<string, unknown>> {
    const ticket = await this.supportRepository.findTicketByIdForUser(ticketId, userId);

    if (!ticket) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Support ticket not found.",
        statusCode: 404,
      });
    }

    return toSupportTicket(ticket);
  }

  public async updateAdminSupportTicket(input: {
    ticketId: string;
    payload: AdminSupportTicketUpdateRequest;
    adminUserId: string;
  }): Promise<Record<string, unknown>> {
    try {
      const updated = await this.supportRepository.updateTicketAdmin({
        ticketId: input.ticketId,
        status: input.payload.status,
        assignedToUserId: input.payload.assigned_to_user_id,
        note: input.payload.note,
        actorAdminUserId: input.adminUserId,
      });

      if (!updated) {
        throw new AppError({
          code: "NOT_FOUND",
          message: "Support ticket not found.",
          statusCode: 404,
        });
      }

      return toSupportTicket(updated);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "ASSIGNEE_NOT_FOUND") {
        throw new AppError({
          code: "BAD_REQUEST",
          message: "Assigned admin user not found.",
          statusCode: 400,
        });
      }

      throw error;
    }
  }
}
