import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

const USERS: ReadonlyArray<{
  id: string;
  role: "admin" | "commerce" | "rider";
  name: string;
  email: string;
  passwordHash: string;
  phone_number: string;
  whatsapp: string;
}> = [
  {
    id: seedIds.users.admin,
    role: "admin",
    name: "Admin Roodi",
    email: "admin@roodi.app",
    // Password: Admin@123456
    passwordHash: "$2b$12$ruuw3QYDJ8VMADBeOSYUKOHQGqP.lPG9AczrAyVbJmq/BTPiuSAsa",
    phone_number: "+559999000001",
    whatsapp: "+559999000001",
  },
  {
    id: seedIds.users.commerceCentro,
    role: "commerce",
    name: "Mercado Centro",
    email: "comercio.centro@roodi.app",
    // Password: Commerce@123456
    passwordHash: "$2b$12$qy.cPg3Z5XIN26zO1CdTaOjlxBecDrkkbd5METU1Puzu6/tWGg24a",
    phone_number: "+559999000201",
    whatsapp: "+559999000201",
  },
  {
    id: seedIds.users.commerceFarmacia,
    role: "commerce",
    name: "Farmacia Imperial",
    email: "comercio.farmacia@roodi.app",
    // Password: Commerce@123456
    passwordHash: "$2b$12$qy.cPg3Z5XIN26zO1CdTaOjlxBecDrkkbd5METU1Puzu6/tWGg24a",
    phone_number: "+559999000202",
    whatsapp: "+559999000202",
  },
  {
    id: seedIds.users.riderJoao,
    role: "rider",
    name: "Joao Rider",
    email: "rider.joao@roodi.app",
    // Password: Rider@123456
    passwordHash: "$2b$12$q7M8MqSbE9Vr33k.Iw.lTuRj/HJ1lsIlRomDbi3QxPQBBTR0XlG86",
    phone_number: "+559999000301",
    whatsapp: "+559999000301",
  },
  {
    id: seedIds.users.riderMaria,
    role: "rider",
    name: "Maria Rider",
    email: "rider.maria@roodi.app",
    // Password: Rider@123456
    passwordHash: "$2b$12$q7M8MqSbE9Vr33k.Iw.lTuRj/HJ1lsIlRomDbi3QxPQBBTR0XlG86",
    phone_number: "+559999000302",
    whatsapp: "+559999000302",
  },
  {
    id: seedIds.users.riderPedro,
    role: "rider",
    name: "Pedro Rider",
    email: "rider.pedro@roodi.app",
    // Password: Rider@123456
    passwordHash: "$2b$12$q7M8MqSbE9Vr33k.Iw.lTuRj/HJ1lsIlRomDbi3QxPQBBTR0XlG86",
    phone_number: "+559999000303",
    whatsapp: "+559999000303",
  },
];

export async function seedUsers({ prisma }: SeedContext): Promise<void> {
  for (const user of USERS) {
    const email = user.email.toLowerCase();

    await prisma.users.upsert({
      where: { email },
      update: {
        role: user.role,
        status: "active",
        name: user.name,
        password_hash: user.passwordHash,
        phone_number: user.phone_number,
        whatsapp: user.whatsapp,
        profile_picture_url: null,
      },
      create: {
        id: user.id,
        role: user.role,
        status: "active",
        name: user.name,
        email,
        password_hash: user.passwordHash,
        phone_number: user.phone_number,
        whatsapp: user.whatsapp,
        profile_picture_url: null,
      },
    });
  }

  for (const user of USERS) {
    const email = user.email.toLowerCase();
    const providerUserId = `local:${email}`;

    await prisma.user_identities.upsert({
      where: {
        provider_provider_user_id: {
          provider: "local",
          provider_user_id: providerUserId,
        },
      },
      update: {
        user_id: user.id,
        provider_email: email,
      },
      create: {
        user_id: user.id,
        provider: "local",
        provider_user_id: providerUserId,
        provider_email: email,
      },
    });
  }

  for (const user of USERS) {
    await prisma.user_notification_settings.upsert({
      where: { user_id: user.id },
      update: {
        delivery: true,
        payment: true,
        promotions: false,
        app_updates: true,
        security: true,
        support: true,
      },
      create: {
        user_id: user.id,
        delivery: true,
        payment: true,
        promotions: false,
        app_updates: true,
        security: true,
        support: true,
      },
    });
  }
}
