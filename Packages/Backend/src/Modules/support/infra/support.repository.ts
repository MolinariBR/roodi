import type { Prisma, PrismaClient, support_faqs } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type {
  SupportTicketCreateRequest,
  SupportTicketListQuery,
} from "@modules/support/domain/support.schemas";

const USER_SUMMARY_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
} satisfies Prisma.usersSelect;

const SUPPORT_TICKET_INCLUDE = {
  users_support_tickets_created_by_user_idTousers: {
    select: USER_SUMMARY_SELECT,
  },
  users_support_tickets_assigned_to_user_idTousers: {
    select: USER_SUMMARY_SELECT,
  },
} satisfies Prisma.support_ticketsInclude;

export type SupportTicketWithUsers = Prisma.support_ticketsGetPayload<{
  include: typeof SUPPORT_TICKET_INCLUDE;
}>;

type ListSupportTicketsResult = {
  items: SupportTicketWithUsers[];
  total: number;
};

type CreateSupportTicketInput = {
  userId: string;
  payload: SupportTicketCreateRequest;
};

export class SupportRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public listActiveFaqs(): Promise<support_faqs[]> {
    return this.prismaClient.support_faqs.findMany({
      where: {
        active: true,
      },
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    });
  }

  public async listTicketsByUser(
    userId: string,
    query: SupportTicketListQuery,
  ): Promise<ListSupportTicketsResult> {
    const where: Prisma.support_ticketsWhereInput = {
      created_by_user_id: userId,
    };

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.support_tickets.findMany({
        where,
        include: SUPPORT_TICKET_INCLUDE,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),
      this.prismaClient.support_tickets.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  public async listTicketsAdmin(query: SupportTicketListQuery): Promise<ListSupportTicketsResult> {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.support_tickets.findMany({
        include: SUPPORT_TICKET_INCLUDE,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),
      this.prismaClient.support_tickets.count(),
    ]);

    return { items, total };
  }

  public createTicket({
    userId,
    payload,
  }: CreateSupportTicketInput): Promise<SupportTicketWithUsers> {
    return this.prismaClient.support_tickets.create({
      data: {
        created_by_user_id: userId,
        order_id: payload.order_id,
        subject: payload.subject,
        description: payload.description,
        priority: payload.priority,
      },
      include: SUPPORT_TICKET_INCLUDE,
    });
  }

  public findTicketByIdForUser(
    ticketId: string,
    userId: string,
  ): Promise<SupportTicketWithUsers | null> {
    return this.prismaClient.support_tickets.findFirst({
      where: {
        id: ticketId,
        created_by_user_id: userId,
      },
      include: SUPPORT_TICKET_INCLUDE,
    });
  }

  public findTicketById(ticketId: string): Promise<SupportTicketWithUsers | null> {
    return this.prismaClient.support_tickets.findUnique({
      where: {
        id: ticketId,
      },
      include: SUPPORT_TICKET_INCLUDE,
    });
  }

  public async updateTicketAdmin(input: {
    ticketId: string;
    status?: Prisma.support_ticketsUpdateInput["status"];
    assignedToUserId?: string;
    note?: string;
    actorAdminUserId: string;
  }): Promise<SupportTicketWithUsers | null> {
    const now = new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const existing = await tx.support_tickets.findUnique({
        where: { id: input.ticketId },
      });

      if (!existing) {
        return null;
      }

      if (input.assignedToUserId) {
        const assignee = await tx.users.findFirst({
          where: {
            id: input.assignedToUserId,
            role: "admin",
            status: "active",
          },
          select: {
            id: true,
          },
        });

        if (!assignee) {
          throw new Error("ASSIGNEE_NOT_FOUND");
        }
      }

      const nextStatus = input.status ?? existing.status;
      const resolvedAt =
        nextStatus === "resolved" || nextStatus === "closed" ? now : null;

      await tx.support_tickets.update({
        where: { id: existing.id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.assignedToUserId !== undefined
            ? { assigned_to_user_id: input.assignedToUserId }
            : {}),
          resolved_at: resolvedAt,
          updated_at: now,
        },
      });

      if (input.note) {
        await tx.support_ticket_messages.create({
          data: {
            ticket_id: existing.id,
            author_user_id: input.actorAdminUserId,
            message: input.note,
            internal_note: true,
            created_at: now,
          },
        });
      }

      return tx.support_tickets.findUnique({
        where: { id: existing.id },
        include: SUPPORT_TICKET_INCLUDE,
      });
    });
  }
}
