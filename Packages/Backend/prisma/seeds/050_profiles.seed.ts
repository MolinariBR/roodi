import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

type BankSeed = {
  id: string;
  userId: string;
  bankName: string;
  agency: string;
  account: string;
  accountType: "corrente" | "poupanca";
  pixKey: string;
};

type AddressSeed = {
  id: string;
  userId: string;
  addressType: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string | null;
  isPrimary: boolean;
};

type RiderVehicleSeed = {
  id: string;
  riderUserId: string;
  vehicleType: "bicicleta" | "moto" | "carro";
  brand: string;
  model: string;
  vehicleYear: number;
  plate: string | null;
  validationStatus: "pending" | "approved";
  isPrimary: boolean;
};

type RiderDocumentSeed = {
  id: string;
  riderUserId: string;
  documentType: "rg" | "cnh" | "cpf" | "residence_proof" | "vehicle_proof";
  documentNumber: string;
  fileUrl: string;
  validationStatus: "pending" | "approved";
};

const BANK_ACCOUNTS: ReadonlyArray<BankSeed> = [
  {
    id: seedIds.profiles.bankAccounts.adminPrimary,
    userId: seedIds.users.admin,
    bankName: "Banco do Brasil",
    agency: "1100",
    account: "90001-0",
    accountType: "corrente",
    pixKey: "admin@roodi.app",
  },
  {
    id: seedIds.profiles.bankAccounts.commerceCentroPrimary,
    userId: seedIds.users.commerceCentro,
    bankName: "Caixa",
    agency: "1200",
    account: "91001-1",
    accountType: "corrente",
    pixKey: "comercio.centro@roodi.app",
  },
  {
    id: seedIds.profiles.bankAccounts.commerceFarmaciaPrimary,
    userId: seedIds.users.commerceFarmacia,
    bankName: "Bradesco",
    agency: "1300",
    account: "92002-2",
    accountType: "corrente",
    pixKey: "comercio.farmacia@roodi.app",
  },
  {
    id: seedIds.profiles.bankAccounts.riderJoaoPrimary,
    userId: seedIds.users.riderJoao,
    bankName: "Nubank",
    agency: "0001",
    account: "93003-3",
    accountType: "corrente",
    pixKey: "rider.joao@roodi.app",
  },
  {
    id: seedIds.profiles.bankAccounts.riderMariaPrimary,
    userId: seedIds.users.riderMaria,
    bankName: "Inter",
    agency: "0001",
    account: "94004-4",
    accountType: "corrente",
    pixKey: "rider.maria@roodi.app",
  },
  {
    id: seedIds.profiles.bankAccounts.riderPedroPrimary,
    userId: seedIds.users.riderPedro,
    bankName: "Santander",
    agency: "1400",
    account: "95005-5",
    accountType: "corrente",
    pixKey: "rider.pedro@roodi.app",
  },
];

const ADDRESSES: ReadonlyArray<AddressSeed> = [
  {
    id: seedIds.profiles.addresses.commerceCentroPoint,
    userId: seedIds.users.commerceCentro,
    addressType: "ponto",
    cep: "65901-000",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Centro",
    street: "Rua Simplício Moreira",
    number: "100",
    complement: null,
    isPrimary: true,
  },
  {
    id: seedIds.profiles.addresses.commerceFarmaciaPoint,
    userId: seedIds.users.commerceFarmacia,
    addressType: "ponto",
    cep: "65916-050",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Bacuri",
    street: "Rua Dom Pedro II",
    number: "220",
    complement: "Loja A",
    isPrimary: true,
  },
  {
    id: seedIds.profiles.addresses.riderJoaoResidence,
    userId: seedIds.users.riderJoao,
    addressType: "residencia",
    cep: "65900-120",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Vila Lobão",
    street: "Rua Benedito Leite",
    number: "45",
    complement: null,
    isPrimary: true,
  },
  {
    id: seedIds.profiles.addresses.riderJoaoPoint,
    userId: seedIds.users.riderJoao,
    addressType: "ponto",
    cep: "65901-000",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Centro",
    street: "Avenida Dorgival Pinheiro de Sousa",
    number: "510",
    complement: null,
    isPrimary: false,
  },
  {
    id: seedIds.profiles.addresses.riderMariaResidence,
    userId: seedIds.users.riderMaria,
    addressType: "residencia",
    cep: "65906-030",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Bacuri",
    street: "Rua Paraíba",
    number: "89",
    complement: "Casa 2",
    isPrimary: true,
  },
  {
    id: seedIds.profiles.addresses.riderMariaPoint,
    userId: seedIds.users.riderMaria,
    addressType: "ponto",
    cep: "65900-420",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Centro",
    street: "Rua Ceará",
    number: "31",
    complement: null,
    isPrimary: false,
  },
  {
    id: seedIds.profiles.addresses.riderPedroResidence,
    userId: seedIds.users.riderPedro,
    addressType: "residencia",
    cep: "65915-010",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "São José",
    street: "Rua São José",
    number: "150",
    complement: null,
    isPrimary: true,
  },
  {
    id: seedIds.profiles.addresses.riderPedroPoint,
    userId: seedIds.users.riderPedro,
    addressType: "ponto",
    cep: "65906-030",
    state: "MA",
    city: "Imperatriz",
    neighborhood: "Bacuri",
    street: "Avenida Bernardo Sayão",
    number: "1200",
    complement: null,
    isPrimary: false,
  },
];

const RIDER_VEHICLES: ReadonlyArray<RiderVehicleSeed> = [
  {
    id: seedIds.profiles.riderVehicles.joaoPrimary,
    riderUserId: seedIds.users.riderJoao,
    vehicleType: "moto",
    brand: "Honda",
    model: "CG 160",
    vehicleYear: 2022,
    plate: "ROD1A01",
    validationStatus: "approved",
    isPrimary: true,
  },
  {
    id: seedIds.profiles.riderVehicles.mariaPrimary,
    riderUserId: seedIds.users.riderMaria,
    vehicleType: "bicicleta",
    brand: "Caloi",
    model: "Urban",
    vehicleYear: 2024,
    plate: null,
    validationStatus: "approved",
    isPrimary: true,
  },
  {
    id: seedIds.profiles.riderVehicles.pedroPrimary,
    riderUserId: seedIds.users.riderPedro,
    vehicleType: "moto",
    brand: "Yamaha",
    model: "Factor 150",
    vehicleYear: 2021,
    plate: "ROD1B02",
    validationStatus: "pending",
    isPrimary: true,
  },
];

const RIDER_DOCUMENTS: ReadonlyArray<RiderDocumentSeed> = [
  {
    id: seedIds.profiles.riderDocuments.joaoCnh,
    riderUserId: seedIds.users.riderJoao,
    documentType: "cnh",
    documentNumber: "00011122233",
    fileUrl: "https://cdn.roodi.dev/docs/rider-joao-cnh.pdf",
    validationStatus: "approved",
  },
  {
    id: seedIds.profiles.riderDocuments.mariaRg,
    riderUserId: seedIds.users.riderMaria,
    documentType: "rg",
    documentNumber: "MG1234567",
    fileUrl: "https://cdn.roodi.dev/docs/rider-maria-rg.pdf",
    validationStatus: "approved",
  },
  {
    id: seedIds.profiles.riderDocuments.pedroCnh,
    riderUserId: seedIds.users.riderPedro,
    documentType: "cnh",
    documentNumber: "99988877766",
    fileUrl: "https://cdn.roodi.dev/docs/rider-pedro-cnh.pdf",
    validationStatus: "pending",
  },
];

export async function seedProfiles({ prisma }: SeedContext): Promise<void> {
  await prisma.commerce_profiles.upsert({
    where: { user_id: seedIds.users.commerceCentro },
    update: {
      commerce_code: "COM-CTR-0001",
      trade_name: "Mercado Centro",
      legal_name: "Mercado Centro LTDA",
      tax_id: "12.345.678/0001-10",
      rank_level: "Gold",
      rating: "4.80",
      is_open: true,
    },
    create: {
      user_id: seedIds.users.commerceCentro,
      commerce_code: "COM-CTR-0001",
      trade_name: "Mercado Centro",
      legal_name: "Mercado Centro LTDA",
      tax_id: "12.345.678/0001-10",
      rank_level: "Gold",
      rating: "4.80",
      is_open: true,
    },
  });

  await prisma.commerce_profiles.upsert({
    where: { user_id: seedIds.users.commerceFarmacia },
    update: {
      commerce_code: "COM-FAR-0002",
      trade_name: "Farmacia Imperial",
      legal_name: "Farmacia Imperial ME",
      tax_id: "98.765.432/0001-55",
      rank_level: "Silver",
      rating: "4.60",
      is_open: true,
    },
    create: {
      user_id: seedIds.users.commerceFarmacia,
      commerce_code: "COM-FAR-0002",
      trade_name: "Farmacia Imperial",
      legal_name: "Farmacia Imperial ME",
      tax_id: "98.765.432/0001-55",
      rank_level: "Silver",
      rating: "4.60",
      is_open: true,
    },
  });

  await prisma.credits_wallets.upsert({
    where: { commerce_user_id: seedIds.users.commerceCentro },
    update: {
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
    create: {
      commerce_user_id: seedIds.users.commerceCentro,
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
  });

  await prisma.credits_wallets.upsert({
    where: { commerce_user_id: seedIds.users.commerceFarmacia },
    update: {
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
    create: {
      commerce_user_id: seedIds.users.commerceFarmacia,
      balance_brl: "300.00",
      reserved_brl: "0.00",
    },
  });

  await prisma.rider_profiles.upsert({
    where: { user_id: seedIds.users.riderJoao },
    update: {
      rider_code: "RID-0001",
      rank_level: "Veterano",
      rating: "4.95",
      completed_deliveries: 420,
      online_minutes_total: 5120,
      is_online: true,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T10:00:00.000Z"),
    },
    create: {
      user_id: seedIds.users.riderJoao,
      rider_code: "RID-0001",
      rank_level: "Veterano",
      rating: "4.95",
      completed_deliveries: 420,
      online_minutes_total: 5120,
      is_online: true,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T10:00:00.000Z"),
    },
  });

  await prisma.rider_profiles.upsert({
    where: { user_id: seedIds.users.riderMaria },
    update: {
      rider_code: "RID-0002",
      rank_level: "Regular",
      rating: "4.70",
      completed_deliveries: 188,
      online_minutes_total: 3010,
      is_online: false,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T09:30:00.000Z"),
    },
    create: {
      user_id: seedIds.users.riderMaria,
      rider_code: "RID-0002",
      rank_level: "Regular",
      rating: "4.70",
      completed_deliveries: 188,
      online_minutes_total: 3010,
      is_online: false,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T09:30:00.000Z"),
    },
  });

  await prisma.rider_profiles.upsert({
    where: { user_id: seedIds.users.riderPedro },
    update: {
      rider_code: "RID-0003",
      rank_level: "Iniciante",
      rating: "4.30",
      completed_deliveries: 57,
      online_minutes_total: 920,
      is_online: false,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T08:20:00.000Z"),
    },
    create: {
      user_id: seedIds.users.riderPedro,
      rider_code: "RID-0003",
      rank_level: "Iniciante",
      rating: "4.30",
      completed_deliveries: 57,
      online_minutes_total: 920,
      is_online: false,
      cooldown_until: null,
      last_status_change_at: new Date("2026-02-14T08:20:00.000Z"),
    },
  });

  await prisma.rider_wallets.upsert({
    where: { rider_user_id: seedIds.users.riderJoao },
    update: { balance_brl: "0.00", pending_brl: "0.00" },
    create: {
      rider_user_id: seedIds.users.riderJoao,
      balance_brl: "0.00",
      pending_brl: "0.00",
    },
  });

  await prisma.rider_wallets.upsert({
    where: { rider_user_id: seedIds.users.riderMaria },
    update: { balance_brl: "0.00", pending_brl: "0.00" },
    create: {
      rider_user_id: seedIds.users.riderMaria,
      balance_brl: "0.00",
      pending_brl: "0.00",
    },
  });

  await prisma.rider_wallets.upsert({
    where: { rider_user_id: seedIds.users.riderPedro },
    update: { balance_brl: "0.00", pending_brl: "0.00" },
    create: {
      rider_user_id: seedIds.users.riderPedro,
      balance_brl: "0.00",
      pending_brl: "0.00",
    },
  });

  for (const account of BANK_ACCOUNTS) {
    await prisma.user_bank_accounts.upsert({
      where: { id: account.id },
      update: {
        user_id: account.userId,
        bank_name: account.bankName,
        agency: account.agency,
        account: account.account,
        account_type: account.accountType,
        pix_key: account.pixKey,
        is_primary: true,
      },
      create: {
        id: account.id,
        user_id: account.userId,
        bank_name: account.bankName,
        agency: account.agency,
        account: account.account,
        account_type: account.accountType,
        pix_key: account.pixKey,
        is_primary: true,
      },
    });
  }

  for (const address of ADDRESSES) {
    await prisma.user_addresses.upsert({
      where: { id: address.id },
      update: {
        user_id: address.userId,
        address_type: address.addressType,
        cep: address.cep,
        state: address.state,
        city: address.city,
        neighborhood: address.neighborhood,
        street: address.street,
        number: address.number,
        complement: address.complement,
        is_primary: address.isPrimary,
      },
      create: {
        id: address.id,
        user_id: address.userId,
        address_type: address.addressType,
        cep: address.cep,
        state: address.state,
        city: address.city,
        neighborhood: address.neighborhood,
        street: address.street,
        number: address.number,
        complement: address.complement,
        is_primary: address.isPrimary,
      },
    });
  }

  for (const riderVehicle of RIDER_VEHICLES) {
    await prisma.rider_vehicles.upsert({
      where: { id: riderVehicle.id },
      update: {
        rider_user_id: riderVehicle.riderUserId,
        vehicle_type: riderVehicle.vehicleType,
        brand: riderVehicle.brand,
        model: riderVehicle.model,
        vehicle_year: riderVehicle.vehicleYear,
        plate: riderVehicle.plate,
        validation_status: riderVehicle.validationStatus,
        is_primary: riderVehicle.isPrimary,
      },
      create: {
        id: riderVehicle.id,
        rider_user_id: riderVehicle.riderUserId,
        vehicle_type: riderVehicle.vehicleType,
        brand: riderVehicle.brand,
        model: riderVehicle.model,
        vehicle_year: riderVehicle.vehicleYear,
        plate: riderVehicle.plate,
        validation_status: riderVehicle.validationStatus,
        is_primary: riderVehicle.isPrimary,
      },
    });
  }

  for (const riderDocument of RIDER_DOCUMENTS) {
    await prisma.rider_documents.upsert({
      where: { id: riderDocument.id },
      update: {
        rider_user_id: riderDocument.riderUserId,
        document_type: riderDocument.documentType,
        document_number: riderDocument.documentNumber,
        file_url: riderDocument.fileUrl,
        validation_status: riderDocument.validationStatus,
      },
      create: {
        id: riderDocument.id,
        rider_user_id: riderDocument.riderUserId,
        document_type: riderDocument.documentType,
        document_number: riderDocument.documentNumber,
        file_url: riderDocument.fileUrl,
        validation_status: riderDocument.validationStatus,
      },
    });
  }
}
