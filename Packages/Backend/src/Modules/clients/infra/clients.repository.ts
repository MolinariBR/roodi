import type { Prisma, PrismaClient, commerce_clients, users } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type {
  ClientAddressInput,
  ClientListQuery,
  ClientUpsertRequest,
} from "@modules/clients/domain/clients.schemas";

type CommerceUserSummary = Pick<users, "id" | "role" | "status">;

const toAddressColumns = (
  address: ClientAddressInput,
): Pick<
  Prisma.commerce_clientsUncheckedCreateInput,
  "cep" | "state" | "city" | "neighborhood" | "street" | "number" | "complement"
> => {
  return {
    cep: address.cep,
    state: address.state,
    city: address.city,
    neighborhood: address.neighborhood,
    street: address.street,
    number: address.number,
    complement: address.complement,
  };
};

export class ClientsRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findActiveCommerceUserById(userId: string): Promise<CommerceUserSummary | null> {
    return this.prismaClient.users.findFirst({
      where: {
        id: userId,
        role: "commerce",
        status: "active",
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });
  }

  public async listCommerceClients(input: {
    commerceUserId: string;
    query: ClientListQuery;
  }): Promise<{ items: commerce_clients[]; total: number }> {
    const search = input.query.search?.trim();
    const where: Prisma.commerce_clientsWhereInput = {
      commerce_user_id: input.commerceUserId,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone_number: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.commerce_clients.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip: (input.query.page - 1) * input.query.limit,
        take: input.query.limit,
      }),
      this.prismaClient.commerce_clients.count({ where }),
    ]);

    return { items, total };
  }

  public createCommerceClient(input: {
    commerceUserId: string;
    payload: ClientUpsertRequest;
  }): Promise<commerce_clients> {
    const addressColumns = toAddressColumns(input.payload.address);

    return this.prismaClient.commerce_clients.create({
      data: {
        commerce_user_id: input.commerceUserId,
        name: input.payload.name,
        phone_number: input.payload.phone_number,
        email: input.payload.email,
        notes: input.payload.notes,
        ...addressColumns,
      },
    });
  }

  public findCommerceClientById(input: {
    commerceUserId: string;
    clientId: string;
  }): Promise<commerce_clients | null> {
    return this.prismaClient.commerce_clients.findFirst({
      where: {
        id: input.clientId,
        commerce_user_id: input.commerceUserId,
      },
    });
  }

  public updateCommerceClient(input: {
    clientId: string;
    payload: ClientUpsertRequest;
  }): Promise<commerce_clients> {
    const addressColumns = toAddressColumns(input.payload.address);

    return this.prismaClient.commerce_clients.update({
      where: {
        id: input.clientId,
      },
      data: {
        name: input.payload.name,
        phone_number: input.payload.phone_number,
        email: input.payload.email,
        notes: input.payload.notes,
        updated_at: new Date(),
        ...addressColumns,
      },
    });
  }
}
