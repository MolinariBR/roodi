import type { Prisma, credits_ledger } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type {
  AdminCreditAdjustmentRequest,
  CreditsLedgerQuery,
} from "@modules/credits/domain/credits.schemas";
import { CreditsRepository } from "@modules/credits/infra/credits.repository";

const decimalToNumber = (
  value: Prisma.Decimal | number | string | null | undefined,
): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const convertedValue = Number(value);
  return Number.isFinite(convertedValue) ? convertedValue : 0;
};

const toCreditsLedgerItem = (item: credits_ledger): Record<string, unknown> => {
  const reference =
    item.reference_type && item.reference_id
      ? `${item.reference_type}:${item.reference_id}`
      : item.reference_type ?? undefined;

  return {
    id: item.id,
    type: item.entry_type,
    amount_brl: decimalToNumber(item.amount_brl),
    balance_after_brl: decimalToNumber(item.balance_after_brl),
    ...(item.order_id ? { order_id: item.order_id } : {}),
    ...(reference ? { reference } : {}),
    created_at: item.created_at.toISOString(),
  };
};

export class CreditsService {
  constructor(private readonly creditsRepository = new CreditsRepository()) {}

  private async assertCommerceUser(userId: string): Promise<void> {
    const commerceUser = await this.creditsRepository.findActiveCommerceUserById(userId);
    if (!commerceUser) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "User is not allowed to access commerce credits.",
        statusCode: 403,
      });
    }
  }

  public async getBalance(commerceUserId: string): Promise<{
    success: true;
    data: {
      balance_brl: number;
      reserved_brl: number;
      available_brl: number;
      updated_at: string;
    };
  }> {
    await this.assertCommerceUser(commerceUserId);
    const wallet = await this.creditsRepository.getOrCreateWallet(commerceUserId);

    const balanceBrl = decimalToNumber(wallet.balance_brl);
    const reservedBrl = decimalToNumber(wallet.reserved_brl);

    return {
      success: true,
      data: {
        balance_brl: balanceBrl,
        reserved_brl: reservedBrl,
        available_brl: balanceBrl,
        updated_at: wallet.updated_at.toISOString(),
      },
    };
  }

  public async listLedger(
    commerceUserId: string,
    query: CreditsLedgerQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    await this.assertCommerceUser(commerceUserId);
    const { items, total } = await this.creditsRepository.listCreditsLedger(
      commerceUserId,
      query,
    );

    return {
      success: true,
      data: items.map(toCreditsLedgerItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async listAdminLedger(
    query: CreditsLedgerQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { items, total } = await this.creditsRepository.listCreditsLedgerAdmin(query);

    return {
      success: true,
      data: items.map(toCreditsLedgerItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async createAdminAdjustment(input: {
    adminUserId: string;
    payload: AdminCreditAdjustmentRequest;
  }): Promise<{
    success: true;
    data: {
      adjustment_id: string;
      commerce_id: string;
      amount_brl: number;
      created_at: string;
    };
  }> {
    const amountBrl = decimalToNumber(input.payload.amount_brl);

    const normalizeMoneyString = (value: number): string => {
      if (!Number.isFinite(value)) {
        return "0.00";
      }

      return value.toFixed(2);
    };

    try {
      const adjustment = await this.creditsRepository.applyAdminAdjustment({
        commerceUserId: input.payload.commerce_id,
        amountBrl: normalizeMoneyString(amountBrl),
        reason: input.payload.reason,
        createdByUserId: input.adminUserId,
      });

      return {
        success: true,
        data: {
          adjustment_id: adjustment.adjustmentId,
          commerce_id: adjustment.commerceUserId,
          amount_brl: decimalToNumber(adjustment.amountBrl),
          created_at: adjustment.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "COMMERCE_NOT_FOUND") {
        throw new AppError({
          code: "NOT_FOUND",
          message: "Commerce user not found.",
          statusCode: 404,
        });
      }

      if (error instanceof Error && error.message === "NEGATIVE_BALANCE_NOT_ALLOWED") {
        throw new AppError({
          code: "CONFLICT",
          message: "Adjustment would result in negative balance.",
          statusCode: 409,
        });
      }

      throw error;
    }
  }
}
