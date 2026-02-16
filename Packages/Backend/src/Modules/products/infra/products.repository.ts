import type { Prisma, PrismaClient, commerce_products, users } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type {
  ProductListQuery,
  ProductStatus,
  ProductUpsertRequest,
} from "@modules/products/domain/products.schemas";

type CommerceUserSummary = Pick<users, "id" | "role" | "status">;

const toDecimalString = (value: number): string => {
  return value.toFixed(2);
};

export class ProductsRepository {
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

  public async listCommerceProducts(input: {
    commerceUserId: string;
    query: ProductListQuery;
  }): Promise<{ items: commerce_products[]; total: number }> {
    const where: Prisma.commerce_productsWhereInput = {
      commerce_user_id: input.commerceUserId,
      ...(input.query.status ? { status: input.query.status } : {}),
    };

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.commerce_products.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip: (input.query.page - 1) * input.query.limit,
        take: input.query.limit,
      }),
      this.prismaClient.commerce_products.count({ where }),
    ]);

    return { items, total };
  }

  public createCommerceProduct(input: {
    commerceUserId: string;
    payload: ProductUpsertRequest;
  }): Promise<commerce_products> {
    return this.prismaClient.commerce_products.create({
      data: {
        commerce_user_id: input.commerceUserId,
        name: input.payload.name,
        description: input.payload.description,
        price_brl: toDecimalString(input.payload.price_brl),
        stock: input.payload.stock,
      },
    });
  }

  public findCommerceProductById(input: {
    commerceUserId: string;
    productId: string;
  }): Promise<commerce_products | null> {
    return this.prismaClient.commerce_products.findFirst({
      where: {
        id: input.productId,
        commerce_user_id: input.commerceUserId,
      },
    });
  }

  public updateCommerceProduct(input: {
    productId: string;
    payload: ProductUpsertRequest;
  }): Promise<commerce_products> {
    return this.prismaClient.commerce_products.update({
      where: {
        id: input.productId,
      },
      data: {
        name: input.payload.name,
        description: input.payload.description,
        price_brl: toDecimalString(input.payload.price_brl),
        stock: input.payload.stock,
        updated_at: new Date(),
      },
    });
  }

  public updateCommerceProductStatus(input: {
    productId: string;
    status: ProductStatus;
  }): Promise<commerce_products> {
    return this.prismaClient.commerce_products.update({
      where: {
        id: input.productId,
      },
      data: {
        status: input.status,
        updated_at: new Date(),
      },
    });
  }
}
