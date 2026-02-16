import type { Prisma, commerce_products } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type {
  ProductListQuery,
  ProductStatusUpdateRequest,
  ProductUpsertRequest,
} from "@modules/products/domain/products.schemas";
import { ProductsRepository } from "@modules/products/infra/products.repository";

const decimalToNumber = (
  value: Prisma.Decimal | number | string | null | undefined,
): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const convertedValue = Number(value);
  return Number.isFinite(convertedValue) ? convertedValue : 0;
};

const toProductPayload = (product: commerce_products): Record<string, unknown> => {
  return {
    id: product.id,
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    price_brl: decimalToNumber(product.price_brl),
    ...(product.stock !== null ? { stock: product.stock } : {}),
    status: product.status,
    created_at: product.created_at.toISOString(),
  };
};

export class ProductsService {
  constructor(private readonly productsRepository = new ProductsRepository()) {}

  private async assertCommerceUser(userId: string): Promise<void> {
    const commerceUser = await this.productsRepository.findActiveCommerceUserById(userId);
    if (!commerceUser) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "User is not allowed to access commerce products.",
        statusCode: 403,
      });
    }
  }

  public async listCommerceProducts(input: {
    commerceUserId: string;
    query: ProductListQuery;
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

    const { items, total } = await this.productsRepository.listCommerceProducts({
      commerceUserId: input.commerceUserId,
      query: input.query,
    });

    return {
      success: true,
      data: items.map(toProductPayload),
      pagination: {
        page: input.query.page,
        limit: input.query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / input.query.limit) : 0,
      },
    };
  }

  public async createCommerceProduct(input: {
    commerceUserId: string;
    payload: ProductUpsertRequest;
  }): Promise<Record<string, unknown>> {
    await this.assertCommerceUser(input.commerceUserId);

    const created = await this.productsRepository.createCommerceProduct({
      commerceUserId: input.commerceUserId,
      payload: input.payload,
    });

    return toProductPayload(created);
  }

  public async updateCommerceProduct(input: {
    commerceUserId: string;
    productId: string;
    payload: ProductUpsertRequest;
  }): Promise<Record<string, unknown>> {
    await this.assertCommerceUser(input.commerceUserId);

    const existing = await this.productsRepository.findCommerceProductById({
      commerceUserId: input.commerceUserId,
      productId: input.productId,
    });
    if (!existing) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Product not found.",
        statusCode: 404,
      });
    }

    const updated = await this.productsRepository.updateCommerceProduct({
      productId: input.productId,
      payload: input.payload,
    });

    return toProductPayload(updated);
  }

  public async updateCommerceProductStatus(input: {
    commerceUserId: string;
    productId: string;
    payload: ProductStatusUpdateRequest;
  }): Promise<Record<string, unknown>> {
    await this.assertCommerceUser(input.commerceUserId);

    const existing = await this.productsRepository.findCommerceProductById({
      commerceUserId: input.commerceUserId,
      productId: input.productId,
    });
    if (!existing) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Product not found.",
        statusCode: 404,
      });
    }

    const updated = await this.productsRepository.updateCommerceProductStatus({
      productId: input.productId,
      status: input.payload.status,
    });

    return toProductPayload(updated);
  }
}
