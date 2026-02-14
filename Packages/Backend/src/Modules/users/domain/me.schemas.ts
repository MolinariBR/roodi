import { z } from "zod";

const nullableTrimmedStringSchema = z.string().trim().min(1).optional();

export const addressSchema = z.object({
  cep: nullableTrimmedStringSchema,
  state: nullableTrimmedStringSchema,
  city: nullableTrimmedStringSchema,
  neighborhood: nullableTrimmedStringSchema,
  street: nullableTrimmedStringSchema,
  number: nullableTrimmedStringSchema,
  complement: nullableTrimmedStringSchema,
});

export const bankAccountSchema = z.object({
  bank: nullableTrimmedStringSchema,
  agency: nullableTrimmedStringSchema,
  account: nullableTrimmedStringSchema,
  account_type: z.enum(["corrente", "poupanca"]).optional(),
  pix_key: nullableTrimmedStringSchema,
});

export const vehicleSchema = z.object({
  type: z.enum(["bicicleta", "moto", "carro"]).optional(),
  brand: nullableTrimmedStringSchema,
  model: nullableTrimmedStringSchema,
  year: z.coerce.number().int().min(1900).max(3000).optional(),
  plate: nullableTrimmedStringSchema,
});

export const userProfileUpdateRequestSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone_number: nullableTrimmedStringSchema,
  whatsapp: nullableTrimmedStringSchema,
  address_home: addressSchema.optional(),
  address_base: addressSchema.optional(),
  bank_account: bankAccountSchema.optional(),
  vehicle: vehicleSchema.optional(),
});

export const notificationSettingsSchema = z.object({
  delivery: z.boolean(),
  payment: z.boolean(),
  promotions: z.boolean(),
  app_updates: z.boolean(),
  security: z.boolean(),
  support: z.boolean(),
});

export const notificationSettingsUpdateRequestSchema = notificationSettingsSchema;

export type AddressInput = z.infer<typeof addressSchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type UserProfileUpdateRequest = z.infer<typeof userProfileUpdateRequestSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type NotificationSettingsUpdateRequest = z.infer<
  typeof notificationSettingsUpdateRequestSchema
>;
