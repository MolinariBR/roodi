import type { user_addresses, user_bank_accounts, users } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type { AdminUserListQuery } from "@modules/users/domain/admin.schemas";
import type {
  NotificationSettingsInput,
  NotificationSettingsUpdateRequest,
  UserProfileUpdateRequest,
} from "@modules/users/domain/me.schemas";
import { UsersRepository, type UserProfileRecord } from "@modules/users/infra/users.repository";

const HOME_ADDRESS_TYPE = "home";
const BASE_ADDRESS_TYPE = "base";

const decimalToNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const convertedValue = Number(value);
  return Number.isFinite(convertedValue) ? convertedValue : undefined;
};

const toAddressPayload = (address: user_addresses | undefined): Record<string, string> | undefined => {
  if (!address) {
    return undefined;
  }

  return {
    ...(address.cep ? { cep: address.cep } : {}),
    ...(address.state ? { state: address.state } : {}),
    ...(address.city ? { city: address.city } : {}),
    ...(address.neighborhood ? { neighborhood: address.neighborhood } : {}),
    ...(address.street ? { street: address.street } : {}),
    ...(address.number ? { number: address.number } : {}),
    ...(address.complement ? { complement: address.complement } : {}),
  };
};

const toBankAccountPayload = (
  bankAccount: user_bank_accounts | undefined,
): Record<string, string> | undefined => {
  if (!bankAccount) {
    return undefined;
  }

  const payload: Record<string, string> = {};
  if (bankAccount.bank_name) {
    payload.bank = bankAccount.bank_name;
  }
  if (bankAccount.agency) {
    payload.agency = bankAccount.agency;
  }
  if (bankAccount.account) {
    payload.account = bankAccount.account;
  }
  if (bankAccount.account_type) {
    payload.account_type = bankAccount.account_type;
  }
  if (bankAccount.pix_key) {
    payload.pix_key = bankAccount.pix_key;
  }

  return Object.keys(payload).length > 0 ? payload : undefined;
};

const toUserProfilePayload = (profile: UserProfileRecord): Record<string, unknown> => {
  const homeAddress = profile.user_addresses.find(
    (address) => address.address_type === HOME_ADDRESS_TYPE,
  );
  const baseAddress = profile.user_addresses.find(
    (address) => address.address_type === BASE_ADDRESS_TYPE,
  );
  const primaryBankAccount = profile.user_bank_accounts[0];
  const primaryVehicle = profile.rider_vehicles[0];

  const rankLevel = profile.rider_profiles?.rank_level ?? profile.commerce_profiles?.rank_level;
  const rating = profile.rider_profiles?.rating ?? profile.commerce_profiles?.rating;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    ...(profile.phone_number ? { phone_number: profile.phone_number } : {}),
    ...(profile.whatsapp ? { whatsapp: profile.whatsapp } : {}),
    ...(rankLevel ? { rank_level: rankLevel } : {}),
    ...(decimalToNumber(rating) !== undefined ? { rating: decimalToNumber(rating) } : {}),
    ...(profile.rider_profiles?.rider_code ? { rider_id: profile.rider_profiles.rider_code } : {}),
    ...(profile.commerce_profiles?.commerce_code
      ? { commerce_id: profile.commerce_profiles.commerce_code }
      : {}),
    ...(toAddressPayload(homeAddress) ? { address_home: toAddressPayload(homeAddress) } : {}),
    ...(toAddressPayload(baseAddress) ? { address_base: toAddressPayload(baseAddress) } : {}),
    ...(toBankAccountPayload(primaryBankAccount)
      ? { bank_account: toBankAccountPayload(primaryBankAccount) }
      : {}),
    ...(primaryVehicle
      ? {
          vehicle: {
            ...(primaryVehicle.vehicle_type ? { type: primaryVehicle.vehicle_type } : {}),
            ...(primaryVehicle.brand ? { brand: primaryVehicle.brand } : {}),
            ...(primaryVehicle.model ? { model: primaryVehicle.model } : {}),
            ...(primaryVehicle.vehicle_year ? { year: primaryVehicle.vehicle_year } : {}),
            ...(primaryVehicle.plate ? { plate: primaryVehicle.plate } : {}),
          },
        }
      : {}),
  };
};

export class UsersService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  private async assertAuthenticatedUser(userId: string): Promise<users> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid access token.",
        statusCode: 401,
      });
    }

    return user;
  }

  private async buildUserProfileResponse(userId: string): Promise<{
    success: true;
    data: Record<string, unknown>;
  }> {
    const profile = await this.usersRepository.findUserProfileById(userId);
    if (!profile) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "Invalid access token.",
        statusCode: 401,
      });
    }

    return {
      success: true,
      data: toUserProfilePayload(profile),
    };
  }

  public async getMe(userId: string): Promise<{ success: true; data: Record<string, unknown> }> {
    await this.assertAuthenticatedUser(userId);
    return this.buildUserProfileResponse(userId);
  }

  public async updateMe(
    userId: string,
    payload: UserProfileUpdateRequest,
  ): Promise<{ success: true; data: Record<string, unknown> }> {
    const user = await this.assertAuthenticatedUser(userId);
    await this.usersRepository.updateUserProfile(user, payload);
    return this.buildUserProfileResponse(userId);
  }

  public async getMyNotificationSettings(userId: string): Promise<NotificationSettingsInput> {
    await this.assertAuthenticatedUser(userId);
    return this.usersRepository.getOrCreateNotificationSettings(userId);
  }

  public async updateMyNotificationSettings(
    userId: string,
    payload: NotificationSettingsUpdateRequest,
  ): Promise<NotificationSettingsInput> {
    await this.assertAuthenticatedUser(userId);
    return this.usersRepository.updateNotificationSettings(userId, payload);
  }

  public async listAdminUsers(
    query: AdminUserListQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const { items, total } = await this.usersRepository.listUserProfiles({
      page: query.page,
      limit: query.limit,
      role: query.role,
    });

    return {
      success: true,
      data: items.map(toUserProfilePayload),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async updateAdminUserStatus(input: {
    userId: string;
    status: users["status"];
  }): Promise<{ success: true; data: Record<string, unknown> }> {
    const existing = await this.usersRepository.findUserById(input.userId);
    if (!existing) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "User not found.",
        statusCode: 404,
      });
    }

    await this.usersRepository.updateUserStatus({
      userId: input.userId,
      status: input.status,
    });

    const updatedProfile = await this.usersRepository.findUserProfileById(input.userId);
    if (!updatedProfile) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "User not found.",
        statusCode: 404,
      });
    }

    return {
      success: true,
      data: toUserProfilePayload(updatedProfile),
    };
  }
}
