import type { Prisma, PrismaClient, users } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type {
  AddressInput,
  BankAccountInput,
  NotificationSettingsInput,
  UserProfileUpdateRequest,
  VehicleInput,
} from "@modules/users/domain/me.schemas";

const HOME_ADDRESS_TYPE = "home";
const BASE_ADDRESS_TYPE = "base";

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsInput = {
  delivery: true,
  payment: true,
  promotions: false,
  app_updates: true,
  security: true,
  support: true,
};

export type UserProfileRecord = Prisma.usersGetPayload<{
  include: {
    rider_profiles: true;
    commerce_profiles: true;
    user_addresses: true;
    user_bank_accounts: {
      where: {
        is_primary: true;
      };
      orderBy: {
        updated_at: "desc";
      };
      take: 1;
    };
    rider_vehicles: {
      where: {
        is_primary: true;
      };
      orderBy: {
        updated_at: "desc";
      };
      take: 1;
    };
  };
}>;

type UserNotificationSettingsRecord = Prisma.user_notification_settingsGetPayload<{
  select: {
    delivery: true;
    payment: true;
    promotions: true;
    app_updates: true;
    security: true;
    support: true;
  };
}>;

export class UsersRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  public findUserById(userId: string): Promise<users | null> {
    return this.prismaClient.users.findUnique({
      where: { id: userId },
    });
  }

  public findUserProfileById(userId: string): Promise<UserProfileRecord | null> {
    return this.prismaClient.users.findUnique({
      where: { id: userId },
      include: {
        rider_profiles: true,
        commerce_profiles: true,
        user_addresses: true,
        user_bank_accounts: {
          where: {
            is_primary: true,
          },
          orderBy: {
            updated_at: "desc",
          },
          take: 1,
        },
        rider_vehicles: {
          where: {
            is_primary: true,
          },
          orderBy: {
            updated_at: "desc",
          },
          take: 1,
        },
      },
    });
  }

  public async listUserProfiles(input: {
    page: number;
    limit: number;
    role?: users["role"];
  }): Promise<{ items: UserProfileRecord[]; total: number }> {
    const where: Prisma.usersWhereInput = {
      ...(input.role ? { role: input.role } : {}),
    };

    const skip = (input.page - 1) * input.limit;
    const take = input.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.users.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
        include: {
          rider_profiles: true,
          commerce_profiles: true,
          user_addresses: true,
          user_bank_accounts: {
            where: {
              is_primary: true,
            },
            orderBy: {
              updated_at: "desc",
            },
            take: 1,
          },
          rider_vehicles: {
            where: {
              is_primary: true,
            },
            orderBy: {
              updated_at: "desc",
            },
            take: 1,
          },
        },
      }),
      this.prismaClient.users.count({ where }),
    ]);

    return { items, total };
  }

  public async updateUserStatus(input: {
    userId: string;
    status: users["status"];
  }): Promise<void> {
    await this.prismaClient.users.update({
      where: {
        id: input.userId,
      },
      data: {
        status: input.status,
        updated_at: new Date(),
      },
    });
  }

  private async upsertAddress(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      addressType: string;
      address: AddressInput;
    },
  ): Promise<void> {
    const existingAddress = await tx.user_addresses.findFirst({
      where: {
        user_id: input.userId,
        address_type: input.addressType,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    const addressData = {
      cep: input.address.cep,
      state: input.address.state,
      city: input.address.city,
      neighborhood: input.address.neighborhood,
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement,
      updated_at: new Date(),
    };

    if (existingAddress) {
      await tx.user_addresses.update({
        where: { id: existingAddress.id },
        data: addressData,
      });
      return;
    }

    await tx.user_addresses.create({
      data: {
        user_id: input.userId,
        address_type: input.addressType,
        is_primary: input.addressType === HOME_ADDRESS_TYPE,
        ...addressData,
      },
    });
  }

  private async upsertPrimaryBankAccount(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      bankAccount: BankAccountInput;
    },
  ): Promise<void> {
    const existingBankAccount = await tx.user_bank_accounts.findFirst({
      where: {
        user_id: input.userId,
        is_primary: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    const bankAccountData = {
      bank_name: input.bankAccount.bank,
      agency: input.bankAccount.agency,
      account: input.bankAccount.account,
      account_type: input.bankAccount.account_type,
      pix_key: input.bankAccount.pix_key,
      updated_at: new Date(),
    };

    if (existingBankAccount) {
      await tx.user_bank_accounts.update({
        where: { id: existingBankAccount.id },
        data: bankAccountData,
      });
      return;
    }

    await tx.user_bank_accounts.create({
      data: {
        user_id: input.userId,
        is_primary: true,
        ...bankAccountData,
      },
    });
  }

  private async upsertPrimaryVehicle(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      vehicle: VehicleInput;
    },
  ): Promise<void> {
    const existingVehicle = await tx.rider_vehicles.findFirst({
      where: {
        rider_user_id: input.userId,
        is_primary: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    const vehicleData = {
      vehicle_type: input.vehicle.type,
      brand: input.vehicle.brand,
      model: input.vehicle.model,
      vehicle_year: input.vehicle.year,
      plate: input.vehicle.plate,
      updated_at: new Date(),
    };

    if (existingVehicle) {
      await tx.rider_vehicles.update({
        where: { id: existingVehicle.id },
        data: vehicleData,
      });
      return;
    }

    if (!input.vehicle.type) {
      return;
    }

    await tx.rider_vehicles.create({
      data: {
        rider_user_id: input.userId,
        is_primary: true,
        vehicle_type: input.vehicle.type,
        brand: input.vehicle.brand,
        model: input.vehicle.model,
        vehicle_year: input.vehicle.year,
        plate: input.vehicle.plate,
        updated_at: new Date(),
      },
    });
  }

  public async updateUserProfile(
    user: users,
    payload: UserProfileUpdateRequest,
  ): Promise<void> {
    await this.prismaClient.$transaction(async (tx) => {
      const shouldUpdateBaseUser =
        payload.name !== undefined ||
        payload.phone_number !== undefined ||
        payload.whatsapp !== undefined;

      if (shouldUpdateBaseUser) {
        await tx.users.update({
          where: { id: user.id },
          data: {
            name: payload.name,
            phone_number: payload.phone_number,
            whatsapp: payload.whatsapp,
            updated_at: new Date(),
          },
        });
      }

      if (payload.address_home !== undefined) {
        await this.upsertAddress(tx, {
          userId: user.id,
          addressType: HOME_ADDRESS_TYPE,
          address: payload.address_home,
        });
      }

      if (payload.address_base !== undefined) {
        await this.upsertAddress(tx, {
          userId: user.id,
          addressType: BASE_ADDRESS_TYPE,
          address: payload.address_base,
        });
      }

      if (payload.bank_account !== undefined) {
        await this.upsertPrimaryBankAccount(tx, {
          userId: user.id,
          bankAccount: payload.bank_account,
        });
      }

      if (payload.vehicle !== undefined && user.role === "rider") {
        await this.upsertPrimaryVehicle(tx, {
          userId: user.id,
          vehicle: payload.vehicle,
        });
      }
    });
  }

  private toNotificationSettingsRecord(
    data: UserNotificationSettingsRecord,
  ): NotificationSettingsInput {
    return {
      delivery: data.delivery,
      payment: data.payment,
      promotions: data.promotions,
      app_updates: data.app_updates,
      security: data.security,
      support: data.support,
    };
  }

  public async getOrCreateNotificationSettings(
    userId: string,
  ): Promise<NotificationSettingsInput> {
    const settings = await this.prismaClient.user_notification_settings.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        ...DEFAULT_NOTIFICATION_SETTINGS,
      },
      update: {},
      select: {
        delivery: true,
        payment: true,
        promotions: true,
        app_updates: true,
        security: true,
        support: true,
      },
    });

    return this.toNotificationSettingsRecord(settings);
  }

  public async updateNotificationSettings(
    userId: string,
    input: NotificationSettingsInput,
  ): Promise<NotificationSettingsInput> {
    const settings = await this.prismaClient.user_notification_settings.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        ...input,
      },
      update: {
        ...input,
        updated_at: new Date(),
      },
      select: {
        delivery: true,
        payment: true,
        promotions: true,
        app_updates: true,
        security: true,
        support: true,
      },
    });

    return this.toNotificationSettingsRecord(settings);
  }
}
