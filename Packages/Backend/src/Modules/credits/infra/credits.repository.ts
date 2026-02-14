import type {
  Prisma,
  PrismaClient,
  credits_ledger,
  credits_wallets,
  users,
} from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { CreditsLedgerQuery } from "@modules/credits/domain/credits.schemas";

type CommerceUserSummary = Pick<users, "id" | "role" | "status">;

type CreditsLedgerListResult = {
  items: credits_ledger[];
  total: number;
};

export class CreditsRepository {
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

  public getOrCreateWallet(commerceUserId: string): Promise<credits_wallets> {
    return this.prismaClient.credits_wallets.upsert({
      where: {
        commerce_user_id: commerceUserId,
      },
      create: {
        commerce_user_id: commerceUserId,
        balance_brl: 0,
        reserved_brl: 0,
      },
      update: {},
    });
  }

  public async listCreditsLedger(
    commerceUserId: string,
    query: CreditsLedgerQuery,
  ): Promise<CreditsLedgerListResult> {
    const where: Prisma.credits_ledgerWhereInput = {
      commerce_user_id: commerceUserId,
    };

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.credits_ledger.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),
      this.prismaClient.credits_ledger.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  public async listCreditsLedgerAdmin(
    query: CreditsLedgerQuery,
  ): Promise<CreditsLedgerListResult> {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.credits_ledger.findMany({
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),
      this.prismaClient.credits_ledger.count(),
    ]);

    return { items, total };
  }

  public async applyAdminAdjustment(input: {
    commerceUserId: string;
    amountBrl: string;
    reason: string;
    createdByUserId: string;
  }): Promise<{
    adjustmentId: string;
    commerceUserId: string;
    amountBrl: Prisma.Decimal;
    createdAt: Date;
  }> {
    const now = new Date();

    return this.prismaClient.$transaction(async (tx) => {
      const commerceUser = await tx.users.findFirst({
        where: {
          id: input.commerceUserId,
          role: "commerce",
          status: "active",
        },
        select: {
          id: true,
        },
      });

      if (!commerceUser) {
        throw new Error("COMMERCE_NOT_FOUND");
      }

      const wallet = await tx.credits_wallets.upsert({
        where: {
          commerce_user_id: input.commerceUserId,
        },
        create: {
          commerce_user_id: input.commerceUserId,
          balance_brl: 0,
          reserved_brl: 0,
          updated_at: now,
        },
        update: {},
      });

      const nextBalance = Number(wallet.balance_brl) + Number(input.amountBrl);
      if (!Number.isFinite(nextBalance)) {
        throw new Error("INVALID_BALANCE_CALC");
      }

      if (nextBalance < 0) {
        throw new Error("NEGATIVE_BALANCE_NOT_ALLOWED");
      }

      const updatedWallet = await tx.credits_wallets.update({
        where: {
          commerce_user_id: input.commerceUserId,
        },
        data: {
          balance_brl: {
            increment: input.amountBrl,
          },
          updated_at: now,
        },
      });

      const adjustment = await tx.credits_ledger.create({
        data: {
          commerce_user_id: input.commerceUserId,
          entry_type: "adjustment",
          amount_brl: input.amountBrl,
          balance_after_brl: updatedWallet.balance_brl,
          reference_type: "admin_adjustment",
          reason: input.reason,
          created_by_user_id: input.createdByUserId,
          created_at: now,
        },
        select: {
          id: true,
          commerce_user_id: true,
          amount_brl: true,
          created_at: true,
        },
      });

      return {
        adjustmentId: adjustment.id,
        commerceUserId: adjustment.commerce_user_id,
        amountBrl: adjustment.amount_brl,
        createdAt: adjustment.created_at,
      };
    });
  }
}
