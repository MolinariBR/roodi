import type { Prisma } from "@prisma/client";

import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";

type LifecycleOrderSeed = {
  id: string;
  orderCode: string;
  commerceUserId: string;
  riderUserId: string | null;
  clientId: string;
  status:
    | "created"
    | "completed"
    | "rider_assigned"
    | "to_merchant"
    | "at_merchant"
    | "waiting_order"
    | "at_customer"
    | "finishing_delivery"
    | "canceled";
  urgency: "padrao" | "urgente" | "agendado";
  originBairroId: string;
  destinationBairroId: string;
  recipientName: string;
  recipientPhone: string;
  destinationCep: string;
  destinationState: string;
  destinationCity: string;
  destinationNeighborhood: string;
  destinationStreet: string;
  destinationNumber: string;
  destinationComplement: string | null;
  notes: string;
  distanceM: number;
  durationS: number;
  etaMin: number;
  zone: number;
  baseZoneBrl: string;
  urgencyBrl: string;
  sundayBrl: string;
  holidayBrl: string;
  rainBrl: string;
  peakBrl: string;
  totalBrl: string;
  acceptedAt: Date | null;
  completedAt: Date | null;
  canceledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  snapshots: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceBrl: string;
    totalPriceBrl: string;
  }>;
  events: Array<{
    eventType:
      | "order_created"
      | "rider_assigned"
      | "rider_to_merchant"
      | "rider_at_merchant"
      | "waiting_order"
      | "rider_at_customer"
      | "finishing_delivery"
      | "canceled";
    actorUserId: string | null;
    actorRole: "admin" | "commerce" | "rider" | null;
    note: string;
    occurredAt: Date;
    payload?: Prisma.InputJsonValue;
  }>;
};

const ORDER_STATUS_TRANSITIONS: ReadonlyArray<{
  fromStatus:
    | "created"
    | "searching_rider"
    | "rider_assigned"
    | "to_merchant"
    | "at_merchant"
    | "waiting_order"
    | "to_customer"
    | "at_customer"
    | "finishing_delivery"
    | "completed"
    | "canceled";
  toStatus:
    | "searching_rider"
    | "rider_assigned"
    | "to_merchant"
    | "at_merchant"
    | "waiting_order"
    | "to_customer"
    | "at_customer"
    | "finishing_delivery"
    | "completed"
    | "canceled";
}> = [
  { fromStatus: "created", toStatus: "searching_rider" },
  { fromStatus: "created", toStatus: "canceled" },
  { fromStatus: "searching_rider", toStatus: "rider_assigned" },
  { fromStatus: "searching_rider", toStatus: "to_merchant" },
  { fromStatus: "searching_rider", toStatus: "canceled" },
  { fromStatus: "rider_assigned", toStatus: "to_merchant" },
  { fromStatus: "rider_assigned", toStatus: "canceled" },
  { fromStatus: "to_merchant", toStatus: "at_merchant" },
  { fromStatus: "to_merchant", toStatus: "canceled" },
  { fromStatus: "at_merchant", toStatus: "waiting_order" },
  { fromStatus: "at_merchant", toStatus: "canceled" },
  { fromStatus: "waiting_order", toStatus: "to_customer" },
  { fromStatus: "waiting_order", toStatus: "canceled" },
  { fromStatus: "to_customer", toStatus: "at_customer" },
  { fromStatus: "to_customer", toStatus: "canceled" },
  { fromStatus: "at_customer", toStatus: "finishing_delivery" },
  { fromStatus: "at_customer", toStatus: "canceled" },
  { fromStatus: "finishing_delivery", toStatus: "completed" },
  { fromStatus: "finishing_delivery", toStatus: "canceled" },
];

const LIFECYCLE_ORDERS: ReadonlyArray<LifecycleOrderSeed> = [
  {
    id: seedIds.orderLifecycle.created,
    orderCode: "ORD-DEV-0101",
    commerceUserId: seedIds.users.commerceFarmacia,
    riderUserId: null,
    clientId: seedIds.commerceData.clients.farmaciaDiego,
    status: "created",
    urgency: "padrao",
    originBairroId: seedIds.locality.bacuri,
    destinationBairroId: seedIds.locality.vilaLobao,
    recipientName: "Diego Rocha",
    recipientPhone: "+559999102001",
    destinationCep: "65900-120",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Vila Lobão",
    destinationStreet: "Rua Benedito Leite",
    destinationNumber: "210",
    destinationComplement: null,
    notes: "Pedido criado e aguardando envio para dispatch.",
    distanceM: 4200,
    durationS: 360,
    etaMin: 6,
    zone: 5,
    baseZoneBrl: "11.00",
    urgencyBrl: "0.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "11.00",
    acceptedAt: null,
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T11:30:00.000Z"),
    updatedAt: new Date("2026-02-16T11:30:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.farmaciaDipirona,
        productName: "Dipirona 1g",
        quantity: 1,
        unitPriceBrl: "9.90",
        totalPriceBrl: "9.90",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido criado pelo comercio.",
        occurredAt: new Date("2026-02-16T11:30:00.000Z"),
        payload: { status: "created" },
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.riderAssigned,
    orderCode: "ORD-DEV-0102",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: seedIds.users.riderPedro,
    clientId: seedIds.commerceData.clients.centroBruno,
    status: "rider_assigned",
    urgency: "urgente",
    originBairroId: seedIds.locality.centro,
    destinationBairroId: seedIds.locality.saoJose,
    recipientName: "Bruno Lima",
    recipientPhone: "+559999101002",
    destinationCep: "65915-010",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "São José",
    destinationStreet: "Rua São José",
    destinationNumber: "120",
    destinationComplement: "Ap 2",
    notes: "Oferta aceita. Rider aguardando iniciar rota.",
    distanceM: 5277,
    durationS: 397,
    etaMin: 7,
    zone: 6,
    baseZoneBrl: "12.00",
    urgencyBrl: "2.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "14.00",
    acceptedAt: new Date("2026-02-16T11:10:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T11:00:00.000Z"),
    updatedAt: new Date("2026-02-16T11:10:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroMarmitaCarne,
        productName: "Marmita Carne",
        quantity: 1,
        unitPriceBrl: "19.50",
        totalPriceBrl: "19.50",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido criado pelo comercio.",
        occurredAt: new Date("2026-02-16T11:00:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Dispatch inicial realizado.",
        occurredAt: new Date("2026-02-16T11:08:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.toMerchant,
    orderCode: "ORD-DEV-0103",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: seedIds.users.riderPedro,
    clientId: seedIds.commerceData.clients.centroAna,
    status: "to_merchant",
    urgency: "padrao",
    originBairroId: seedIds.locality.centro,
    destinationBairroId: seedIds.locality.bacuri,
    recipientName: "Ana Sousa",
    recipientPhone: "+559999101001",
    destinationCep: "65906-030",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Bacuri",
    destinationStreet: "Avenida Bernardo Sayão",
    destinationNumber: "500",
    destinationComplement: null,
    notes: "Rider em deslocamento para coleta no comercio.",
    distanceM: 3559,
    durationS: 288,
    etaMin: 5,
    zone: 4,
    baseZoneBrl: "10.00",
    urgencyBrl: "0.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "1.00",
    totalBrl: "11.00",
    acceptedAt: new Date("2026-02-16T10:58:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T10:50:00.000Z"),
    updatedAt: new Date("2026-02-16T11:02:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroRefrigerante2L,
        productName: "Refrigerante 2L",
        quantity: 1,
        unitPriceBrl: "12.00",
        totalPriceBrl: "12.00",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T10:50:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider designado para coleta.",
        occurredAt: new Date("2026-02-16T10:56:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderPedro,
        actorRole: "rider",
        note: "Rider saiu para o comercio.",
        occurredAt: new Date("2026-02-16T11:02:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.atMerchant,
    orderCode: "ORD-DEV-0104",
    commerceUserId: seedIds.users.commerceFarmacia,
    riderUserId: seedIds.users.riderMaria,
    clientId: seedIds.commerceData.clients.farmaciaElisa,
    status: "at_merchant",
    urgency: "urgente",
    originBairroId: seedIds.locality.bacuri,
    destinationBairroId: seedIds.locality.centro,
    recipientName: "Elisa Martins",
    recipientPhone: "+559999102002",
    destinationCep: "65900-420",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Centro",
    destinationStreet: "Rua Ceará",
    destinationNumber: "300",
    destinationComplement: "Casa B",
    notes: "Rider chegou ao comercio e aguarda liberacao.",
    distanceM: 3815,
    durationS: 336,
    etaMin: 6,
    zone: 4,
    baseZoneBrl: "10.00",
    urgencyBrl: "2.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "12.00",
    acceptedAt: new Date("2026-02-16T10:25:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T10:15:00.000Z"),
    updatedAt: new Date("2026-02-16T10:33:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.farmaciaVitaminaC,
        productName: "Vitamina C",
        quantity: 1,
        unitPriceBrl: "24.90",
        totalPriceBrl: "24.90",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T10:15:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider designado.",
        occurredAt: new Date("2026-02-16T10:20:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider em deslocamento.",
        occurredAt: new Date("2026-02-16T10:25:00.000Z"),
      },
      {
        eventType: "rider_at_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider chegou no comercio.",
        occurredAt: new Date("2026-02-16T10:33:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.waitingOrder,
    orderCode: "ORD-DEV-0105",
    commerceUserId: seedIds.users.commerceFarmacia,
    riderUserId: seedIds.users.riderMaria,
    clientId: seedIds.commerceData.clients.farmaciaFabio,
    status: "waiting_order",
    urgency: "padrao",
    originBairroId: seedIds.locality.bacuri,
    destinationBairroId: seedIds.locality.vilaLobao,
    recipientName: "Fábio Nunes",
    recipientPhone: "+559999102003",
    destinationCep: "65900-120",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Vila Lobão",
    destinationStreet: "Rua Benedito Leite",
    destinationNumber: "210",
    destinationComplement: null,
    notes: "Comercio finalizando separacao do pedido.",
    distanceM: 4200,
    durationS: 360,
    etaMin: 7,
    zone: 5,
    baseZoneBrl: "11.00",
    urgencyBrl: "0.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "11.00",
    acceptedAt: new Date("2026-02-16T10:05:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T09:58:00.000Z"),
    updatedAt: new Date("2026-02-16T10:18:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.farmaciaCurativo,
        productName: "Curativo Adhesivo",
        quantity: 2,
        unitPriceBrl: "11.00",
        totalPriceBrl: "22.00",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T09:58:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Dispatch inicial concluido.",
        occurredAt: new Date("2026-02-16T10:03:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider a caminho do comercio.",
        occurredAt: new Date("2026-02-16T10:06:00.000Z"),
      },
      {
        eventType: "rider_at_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider no comercio.",
        occurredAt: new Date("2026-02-16T10:12:00.000Z"),
      },
      {
        eventType: "waiting_order",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Comercio preparando pacote.",
        occurredAt: new Date("2026-02-16T10:18:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.atCustomer,
    orderCode: "ORD-DEV-0106",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: seedIds.users.riderJoao,
    clientId: seedIds.commerceData.clients.centroCarla,
    status: "at_customer",
    urgency: "agendado",
    originBairroId: seedIds.locality.centro,
    destinationBairroId: seedIds.locality.saoJose,
    recipientName: "Carla Gomes",
    recipientPhone: "+559999101003",
    destinationCep: "65915-010",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "São José",
    destinationStreet: "Rua São José",
    destinationNumber: "88",
    destinationComplement: null,
    notes: "Rider no local aguardando codigo de confirmacao.",
    distanceM: 5277,
    durationS: 397,
    etaMin: 7,
    zone: 6,
    baseZoneBrl: "12.00",
    urgencyBrl: "1.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "13.00",
    acceptedAt: new Date("2026-02-16T09:20:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T09:10:00.000Z"),
    updatedAt: new Date("2026-02-16T09:42:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroSobremesaPudim,
        productName: "Pudim",
        quantity: 1,
        unitPriceBrl: "7.50",
        totalPriceBrl: "7.50",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T09:10:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider alocado.",
        occurredAt: new Date("2026-02-16T09:15:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider a caminho do comercio.",
        occurredAt: new Date("2026-02-16T09:20:00.000Z"),
      },
      {
        eventType: "rider_at_merchant",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider chegou ao comercio.",
        occurredAt: new Date("2026-02-16T09:25:00.000Z"),
      },
      {
        eventType: "waiting_order",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido aguardando retirada.",
        occurredAt: new Date("2026-02-16T09:28:00.000Z"),
      },
      {
        eventType: "rider_at_customer",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider chegou no cliente.",
        occurredAt: new Date("2026-02-16T09:42:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.finishingDelivery,
    orderCode: "ORD-DEV-0107",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: seedIds.users.riderJoao,
    clientId: seedIds.commerceData.clients.centroAna,
    status: "finishing_delivery",
    urgency: "padrao",
    originBairroId: seedIds.locality.centro,
    destinationBairroId: seedIds.locality.bacuri,
    recipientName: "Ana Sousa",
    recipientPhone: "+559999101001",
    destinationCep: "65906-030",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Bacuri",
    destinationStreet: "Avenida Bernardo Sayão",
    destinationNumber: "500",
    destinationComplement: null,
    notes: "Entrega na etapa final de validacao.",
    distanceM: 3559,
    durationS: 288,
    etaMin: 5,
    zone: 4,
    baseZoneBrl: "10.00",
    urgencyBrl: "0.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "1.00",
    totalBrl: "11.00",
    acceptedAt: new Date("2026-02-16T08:30:00.000Z"),
    completedAt: null,
    canceledAt: null,
    cancelReason: null,
    createdAt: new Date("2026-02-16T08:20:00.000Z"),
    updatedAt: new Date("2026-02-16T08:58:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroMarmitaFrango,
        productName: "Marmita Frango",
        quantity: 1,
        unitPriceBrl: "18.00",
        totalPriceBrl: "18.00",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T08:20:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider alocado.",
        occurredAt: new Date("2026-02-16T08:25:00.000Z"),
      },
      {
        eventType: "finishing_delivery",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider validando encerramento.",
        occurredAt: new Date("2026-02-16T08:58:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orderLifecycle.canceled,
    orderCode: "ORD-DEV-0108",
    commerceUserId: seedIds.users.commerceFarmacia,
    riderUserId: seedIds.users.riderPedro,
    clientId: seedIds.commerceData.clients.farmaciaDiego,
    status: "canceled",
    urgency: "urgente",
    originBairroId: seedIds.locality.bacuri,
    destinationBairroId: seedIds.locality.centro,
    recipientName: "Diego Rocha",
    recipientPhone: "+559999102001",
    destinationCep: "65900-420",
    destinationState: "MA",
    destinationCity: "Imperatriz",
    destinationNeighborhood: "Centro",
    destinationStreet: "Rua Ceará",
    destinationNumber: "300",
    destinationComplement: null,
    notes: "Pedido cancelado por indisponibilidade de item.",
    distanceM: 3815,
    durationS: 336,
    etaMin: 6,
    zone: 4,
    baseZoneBrl: "10.00",
    urgencyBrl: "2.00",
    sundayBrl: "0.00",
    holidayBrl: "0.00",
    rainBrl: "0.00",
    peakBrl: "0.00",
    totalBrl: "12.00",
    acceptedAt: new Date("2026-02-16T08:02:00.000Z"),
    completedAt: null,
    canceledAt: new Date("2026-02-16T08:11:00.000Z"),
    cancelReason: "Produto indisponivel no estoque.",
    createdAt: new Date("2026-02-16T07:55:00.000Z"),
    updatedAt: new Date("2026-02-16T08:11:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.farmaciaProtetorSolar,
        productName: "Protetor Solar FPS50",
        quantity: 1,
        unitPriceBrl: "39.90",
        totalPriceBrl: "39.90",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido criado.",
        occurredAt: new Date("2026-02-16T07:55:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider alocado.",
        occurredAt: new Date("2026-02-16T08:00:00.000Z"),
      },
      {
        eventType: "canceled",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Comercio cancelou o pedido.",
        occurredAt: new Date("2026-02-16T08:11:00.000Z"),
        payload: { reason: "Produto indisponivel no estoque." },
      },
    ],
  },
];

async function upsertLifecycleOrder(
  ctx: SeedContext,
  seed: LifecycleOrderSeed,
): Promise<void> {
  const { prisma } = ctx;

  const order = await prisma.orders.upsert({
    where: { order_code: seed.orderCode },
    update: {
      commerce_user_id: seed.commerceUserId,
      rider_user_id: seed.riderUserId,
      client_id: seed.clientId,
      status: seed.status,
      urgency: seed.urgency,
      origin_bairro_id: seed.originBairroId,
      destination_bairro_id: seed.destinationBairroId,
      recipient_name: seed.recipientName,
      recipient_phone: seed.recipientPhone,
      destination_cep: seed.destinationCep,
      destination_state: seed.destinationState,
      destination_city: seed.destinationCity,
      destination_neighborhood: seed.destinationNeighborhood,
      destination_street: seed.destinationStreet,
      destination_number: seed.destinationNumber,
      destination_complement: seed.destinationComplement,
      notes: seed.notes,
      distance_m: seed.distanceM,
      duration_s: seed.durationS,
      eta_min: seed.etaMin,
      zone: seed.zone,
      base_zone_brl: seed.baseZoneBrl,
      urgency_brl: seed.urgencyBrl,
      sunday_brl: seed.sundayBrl,
      holiday_brl: seed.holidayBrl,
      rain_brl: seed.rainBrl,
      peak_brl: seed.peakBrl,
      total_brl: seed.totalBrl,
      confirmation_code_required: true,
      confirmation_code_status:
        seed.status === "completed"
          ? "validated"
          : seed.status === "at_customer" || seed.status === "finishing_delivery"
            ? "generated"
            : "not_generated",
      accepted_at: seed.acceptedAt,
      completed_at: seed.completedAt,
      canceled_at: seed.canceledAt,
      cancel_reason: seed.cancelReason,
      created_at: seed.createdAt,
      updated_at: seed.updatedAt,
    },
    create: {
      id: seed.id,
      order_code: seed.orderCode,
      commerce_user_id: seed.commerceUserId,
      rider_user_id: seed.riderUserId,
      client_id: seed.clientId,
      status: seed.status,
      urgency: seed.urgency,
      origin_bairro_id: seed.originBairroId,
      destination_bairro_id: seed.destinationBairroId,
      recipient_name: seed.recipientName,
      recipient_phone: seed.recipientPhone,
      destination_cep: seed.destinationCep,
      destination_state: seed.destinationState,
      destination_city: seed.destinationCity,
      destination_neighborhood: seed.destinationNeighborhood,
      destination_street: seed.destinationStreet,
      destination_number: seed.destinationNumber,
      destination_complement: seed.destinationComplement,
      notes: seed.notes,
      distance_m: seed.distanceM,
      duration_s: seed.durationS,
      eta_min: seed.etaMin,
      zone: seed.zone,
      base_zone_brl: seed.baseZoneBrl,
      urgency_brl: seed.urgencyBrl,
      sunday_brl: seed.sundayBrl,
      holiday_brl: seed.holidayBrl,
      rain_brl: seed.rainBrl,
      peak_brl: seed.peakBrl,
      total_brl: seed.totalBrl,
      confirmation_code_required: true,
      confirmation_code_status:
        seed.status === "completed"
          ? "validated"
          : seed.status === "at_customer" || seed.status === "finishing_delivery"
            ? "generated"
            : "not_generated",
      accepted_at: seed.acceptedAt,
      completed_at: seed.completedAt,
      canceled_at: seed.canceledAt,
      cancel_reason: seed.cancelReason,
      created_at: seed.createdAt,
      updated_at: seed.updatedAt,
    },
  });

  await prisma.order_product_snapshots.deleteMany({
    where: { order_id: order.id },
  });

  for (const snapshot of seed.snapshots) {
    await prisma.order_product_snapshots.create({
      data: {
        order_id: order.id,
        product_id: snapshot.productId,
        product_name: snapshot.productName,
        quantity: snapshot.quantity,
        unit_price_brl: snapshot.unitPriceBrl,
        total_price_brl: snapshot.totalPriceBrl,
      },
    });
  }

  await prisma.order_events.deleteMany({
    where: { order_id: order.id },
  });

  for (const event of seed.events) {
    await prisma.order_events.create({
      data: {
        order_id: order.id,
        event_type: event.eventType,
        actor_user_id: event.actorUserId,
        actor_role: event.actorRole,
        note: event.note,
        payload: event.payload ?? {},
        occurred_at: event.occurredAt,
      },
    });
  }
}

export async function seedOrderCompletionAndStates(
  ctx: SeedContext,
): Promise<void> {
  const { prisma } = ctx;

  await prisma.order_status_transitions.deleteMany({});
  await prisma.order_status_transitions.createMany({
    data: ORDER_STATUS_TRANSITIONS.map((item) => ({
      from_status: item.fromStatus,
      to_status: item.toStatus,
    })),
  });

  for (const lifecycleOrder of LIFECYCLE_ORDERS) {
    await upsertLifecycleOrder(ctx, lifecycleOrder);
  }

  await prisma.orders.updateMany({
    where: { id: seedIds.orders.completed },
    data: {
      confirmation_code_required: true,
      confirmation_code_status: "validated",
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.orders.updateMany({
    where: { id: seedIds.orderLifecycle.atCustomer },
    data: {
      confirmation_code_required: true,
      confirmation_code_status: "generated",
      updated_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.order_confirmation_codes.upsert({
    where: { order_id: seedIds.orders.completed },
    update: {
      code_hash: "$2b$10$2n1crO/HYX9p0/Eiax4hcObGh4HaVBu/rO8MuqLxj4ksyb3mixKjq",
      code_last4: "4321",
      generated_at: new Date("2026-02-13T19:38:00.000Z"),
      expires_at: new Date("2026-02-13T20:30:00.000Z"),
      attempts_count: 1,
      max_attempts: 5,
      validated_at: new Date("2026-02-13T19:42:00.000Z"),
      validated_by_rider_user_id: seedIds.users.riderJoao,
      created_at: new Date("2026-02-13T19:38:00.000Z"),
    },
    create: {
      id: seedIds.confirmations.completedOrderCode,
      order_id: seedIds.orders.completed,
      code_hash: "$2b$10$2n1crO/HYX9p0/Eiax4hcObGh4HaVBu/rO8MuqLxj4ksyb3mixKjq",
      code_last4: "4321",
      generated_at: new Date("2026-02-13T19:38:00.000Z"),
      expires_at: new Date("2026-02-13T20:30:00.000Z"),
      attempts_count: 1,
      max_attempts: 5,
      validated_at: new Date("2026-02-13T19:42:00.000Z"),
      validated_by_rider_user_id: seedIds.users.riderJoao,
      created_at: new Date("2026-02-13T19:38:00.000Z"),
    },
  });

  await prisma.order_confirmation_codes.upsert({
    where: { order_id: seedIds.orderLifecycle.atCustomer },
    update: {
      code_hash: "$2b$10$9LIB/Sd26Ezw6G1x/.npEe71w.bn0zrNhibR3UCQYsqOfQjcFWmgO",
      code_last4: "2233",
      generated_at: new Date("2026-02-16T09:39:00.000Z"),
      expires_at: new Date("2026-02-16T10:30:00.000Z"),
      attempts_count: 0,
      max_attempts: 5,
      validated_at: null,
      validated_by_rider_user_id: null,
      created_at: new Date("2026-02-16T09:39:00.000Z"),
    },
    create: {
      id: seedIds.confirmations.atCustomerOrderCode,
      order_id: seedIds.orderLifecycle.atCustomer,
      code_hash: "$2b$10$9LIB/Sd26Ezw6G1x/.npEe71w.bn0zrNhibR3UCQYsqOfQjcFWmgO",
      code_last4: "2233",
      generated_at: new Date("2026-02-16T09:39:00.000Z"),
      expires_at: new Date("2026-02-16T10:30:00.000Z"),
      attempts_count: 0,
      max_attempts: 5,
      validated_at: null,
      validated_by_rider_user_id: null,
      created_at: new Date("2026-02-16T09:39:00.000Z"),
    },
  });
}
