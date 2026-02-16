import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

export async function seedRiderLedger({ prisma }: SeedContext): Promise<void> {
  await prisma.rider_ledger.upsert({
    where: { id: seedIds.riderLedger.joaoCompletedOrderCredit },
    update: {
      rider_user_id: seedIds.users.riderJoao,
      order_id: seedIds.orders.completed,
      entry_type: "credit",
      amount_brl: "12.00",
      balance_after_brl: "12.00",
      reference_type: "order",
      reference_id: seedIds.orders.completed,
      reason: "Repasse de entrega concluida ORD-DEV-0003.",
      created_at: new Date("2026-02-13T19:44:00.000Z"),
    },
    create: {
      id: seedIds.riderLedger.joaoCompletedOrderCredit,
      rider_user_id: seedIds.users.riderJoao,
      order_id: seedIds.orders.completed,
      entry_type: "credit",
      amount_brl: "12.00",
      balance_after_brl: "12.00",
      reference_type: "order",
      reference_id: seedIds.orders.completed,
      reason: "Repasse de entrega concluida ORD-DEV-0003.",
      created_at: new Date("2026-02-13T19:44:00.000Z"),
    },
  });

  await prisma.rider_ledger.upsert({
    where: { id: seedIds.riderLedger.mariaPendingDeliveryCredit },
    update: {
      rider_user_id: seedIds.users.riderMaria,
      order_id: seedIds.orders.toCustomer,
      entry_type: "reservation",
      amount_brl: "12.00",
      balance_after_brl: "0.00",
      reference_type: "order_pending",
      reference_id: seedIds.orders.toCustomer,
      reason: "Repasse reservado enquanto entrega esta em andamento.",
      created_at: new Date("2026-02-16T11:25:00.000Z"),
    },
    create: {
      id: seedIds.riderLedger.mariaPendingDeliveryCredit,
      rider_user_id: seedIds.users.riderMaria,
      order_id: seedIds.orders.toCustomer,
      entry_type: "reservation",
      amount_brl: "12.00",
      balance_after_brl: "0.00",
      reference_type: "order_pending",
      reference_id: seedIds.orders.toCustomer,
      reason: "Repasse reservado enquanto entrega esta em andamento.",
      created_at: new Date("2026-02-16T11:25:00.000Z"),
    },
  });

  await prisma.rider_ledger.upsert({
    where: { id: seedIds.riderLedger.joaoAdjustment },
    update: {
      rider_user_id: seedIds.users.riderJoao,
      order_id: null,
      entry_type: "adjustment",
      amount_brl: "1.00",
      balance_after_brl: "13.00",
      reference_type: "admin_adjustment",
      reference_id: null,
      reason: "Ajuste manual de conciliacao.",
      created_at: new Date("2026-02-16T10:00:00.000Z"),
    },
    create: {
      id: seedIds.riderLedger.joaoAdjustment,
      rider_user_id: seedIds.users.riderJoao,
      order_id: null,
      entry_type: "adjustment",
      amount_brl: "1.00",
      balance_after_brl: "13.00",
      reference_type: "admin_adjustment",
      reference_id: null,
      reason: "Ajuste manual de conciliacao.",
      created_at: new Date("2026-02-16T10:00:00.000Z"),
    },
  });

  await prisma.rider_wallets.upsert({
    where: { rider_user_id: seedIds.users.riderJoao },
    update: {
      balance_brl: "13.00",
      pending_brl: "0.00",
      updated_at: new Date("2026-02-16T10:00:00.000Z"),
    },
    create: {
      rider_user_id: seedIds.users.riderJoao,
      balance_brl: "13.00",
      pending_brl: "0.00",
      updated_at: new Date("2026-02-16T10:00:00.000Z"),
    },
  });

  await prisma.rider_wallets.upsert({
    where: { rider_user_id: seedIds.users.riderMaria },
    update: {
      balance_brl: "0.00",
      pending_brl: "12.00",
      updated_at: new Date("2026-02-16T11:25:00.000Z"),
    },
    create: {
      rider_user_id: seedIds.users.riderMaria,
      balance_brl: "0.00",
      pending_brl: "12.00",
      updated_at: new Date("2026-02-16T11:25:00.000Z"),
    },
  });
}
