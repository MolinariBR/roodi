import type { commerce_clients } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type {
  ClientListQuery,
  ClientUpsertRequest,
} from "@modules/clients/domain/clients.schemas";
import { ClientsRepository } from "@modules/clients/infra/clients.repository";

const hasAnyAddressField = (client: commerce_clients): boolean => {
  return Boolean(
    client.cep ||
      client.state ||
      client.city ||
      client.neighborhood ||
      client.street ||
      client.number ||
      client.complement,
  );
};

const toClientPayload = (client: commerce_clients): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: client.id,
    name: client.name,
    phone_number: client.phone_number,
    created_at: client.created_at.toISOString(),
  };

  if (client.email) {
    payload.email = client.email;
  }

  if (client.notes) {
    payload.notes = client.notes;
  }

  if (hasAnyAddressField(client)) {
    payload.address = {
      ...(client.cep ? { cep: client.cep } : {}),
      ...(client.state ? { state: client.state } : {}),
      ...(client.city ? { city: client.city } : {}),
      ...(client.neighborhood ? { neighborhood: client.neighborhood } : {}),
      ...(client.street ? { street: client.street } : {}),
      ...(client.number ? { number: client.number } : {}),
      ...(client.complement ? { complement: client.complement } : {}),
    };
  }

  return payload;
};

export class ClientsService {
  constructor(private readonly clientsRepository = new ClientsRepository()) {}

  private async assertCommerceUser(userId: string): Promise<void> {
    const commerceUser = await this.clientsRepository.findActiveCommerceUserById(userId);
    if (!commerceUser) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "User is not allowed to access commerce clients.",
        statusCode: 403,
      });
    }
  }

  public async listCommerceClients(input: {
    commerceUserId: string;
    query: ClientListQuery;
  }): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    await this.assertCommerceUser(input.commerceUserId);

    const { items, total } = await this.clientsRepository.listCommerceClients({
      commerceUserId: input.commerceUserId,
      query: input.query,
    });

    return {
      success: true,
      data: items.map(toClientPayload),
      pagination: {
        page: input.query.page,
        limit: input.query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / input.query.limit) : 0,
      },
    };
  }

  public async createCommerceClient(input: {
    commerceUserId: string;
    payload: ClientUpsertRequest;
  }): Promise<Record<string, unknown>> {
    await this.assertCommerceUser(input.commerceUserId);

    const created = await this.clientsRepository.createCommerceClient({
      commerceUserId: input.commerceUserId,
      payload: input.payload,
    });

    return toClientPayload(created);
  }

  public async updateCommerceClient(input: {
    commerceUserId: string;
    clientId: string;
    payload: ClientUpsertRequest;
  }): Promise<Record<string, unknown>> {
    await this.assertCommerceUser(input.commerceUserId);

    const existing = await this.clientsRepository.findCommerceClientById({
      commerceUserId: input.commerceUserId,
      clientId: input.clientId,
    });
    if (!existing) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Client not found.",
        statusCode: 404,
      });
    }

    const updated = await this.clientsRepository.updateCommerceClient({
      clientId: input.clientId,
      payload: input.payload,
    });

    return toClientPayload(updated);
  }
}
