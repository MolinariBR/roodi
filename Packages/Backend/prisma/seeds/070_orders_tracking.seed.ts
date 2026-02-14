import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import type { Prisma } from "@prisma/client";

type OrderSeed = {
  id: string;
  orderCode: string;
  commerceUserId: string;
  riderUserId: string | null;
  clientId: string;
  status:
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
  createdAt: Date;
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
      | "rider_accepted"
      | "rider_to_merchant"
      | "rider_at_merchant"
      | "waiting_order"
      | "rider_to_customer"
      | "rider_at_customer"
      | "finishing_delivery"
      | "completed"
      | "canceled";
    actorUserId: string | null;
    actorRole: "admin" | "commerce" | "rider" | null;
    note: string;
    occurredAt: Date;
    payload?: Prisma.InputJsonValue;
  }>;
};

const ORDER_SEEDS: ReadonlyArray<OrderSeed> = [
  {
    id: seedIds.orders.searchingRider,
    orderCode: "ORD-DEV-0001",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: null,
    clientId: seedIds.commerceData.clients.centroAna,
    status: "searching_rider",
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
    notes: "Pedido aguardando aceite de rider.",
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
    acceptedAt: null,
    completedAt: null,
    createdAt: new Date("2026-02-14T11:20:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroMarmitaFrango,
        productName: "Marmita Frango",
        quantity: 1,
        unitPriceBrl: "18.00",
        totalPriceBrl: "18.00",
      },
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
        note: "Comerciante criou pedido e iniciou busca de rider.",
        occurredAt: new Date("2026-02-14T11:20:00.000Z"),
        payload: { status: "searching_rider" },
      },
    ],
  },
  {
    id: seedIds.orders.toCustomer,
    orderCode: "ORD-DEV-0002",
    commerceUserId: seedIds.users.commerceFarmacia,
    riderUserId: seedIds.users.riderMaria,
    clientId: seedIds.commerceData.clients.farmaciaElisa,
    status: "to_customer",
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
    notes: "Entrega de farmacia em andamento para cliente.",
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
    acceptedAt: new Date("2026-02-14T10:07:00.000Z"),
    completedAt: null,
    createdAt: new Date("2026-02-14T10:00:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.farmaciaDipirona,
        productName: "Dipirona 1g",
        quantity: 2,
        unitPriceBrl: "9.90",
        totalPriceBrl: "19.80",
      },
      {
        productId: seedIds.commerceData.products.farmaciaCurativo,
        productName: "Curativo Adhesivo",
        quantity: 1,
        unitPriceBrl: "11.00",
        totalPriceBrl: "11.00",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido criado pela farmacia.",
        occurredAt: new Date("2026-02-14T10:00:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider alocado por lote de dispatch.",
        occurredAt: new Date("2026-02-14T10:05:00.000Z"),
      },
      {
        eventType: "rider_accepted",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider aceitou a entrega.",
        occurredAt: new Date("2026-02-14T10:07:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider a caminho do comercio.",
        occurredAt: new Date("2026-02-14T10:10:00.000Z"),
      },
      {
        eventType: "rider_at_merchant",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider chegou no comercio.",
        occurredAt: new Date("2026-02-14T10:14:00.000Z"),
      },
      {
        eventType: "waiting_order",
        actorUserId: seedIds.users.commerceFarmacia,
        actorRole: "commerce",
        note: "Pedido em separacao no comercio.",
        occurredAt: new Date("2026-02-14T10:17:00.000Z"),
      },
      {
        eventType: "rider_to_customer",
        actorUserId: seedIds.users.riderMaria,
        actorRole: "rider",
        note: "Rider saiu para entrega ao cliente.",
        occurredAt: new Date("2026-02-14T10:20:00.000Z"),
      },
    ],
  },
  {
    id: seedIds.orders.completed,
    orderCode: "ORD-DEV-0003",
    commerceUserId: seedIds.users.commerceCentro,
    riderUserId: seedIds.users.riderJoao,
    clientId: seedIds.commerceData.clients.centroCarla,
    status: "completed",
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
    notes: "Pedido concluido com confirmacao de entrega.",
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
    acceptedAt: new Date("2026-02-13T19:06:00.000Z"),
    completedAt: new Date("2026-02-13T19:42:00.000Z"),
    createdAt: new Date("2026-02-13T19:00:00.000Z"),
    snapshots: [
      {
        productId: seedIds.commerceData.products.centroMarmitaCarne,
        productName: "Marmita Carne",
        quantity: 1,
        unitPriceBrl: "19.50",
        totalPriceBrl: "19.50",
      },
      {
        productId: seedIds.commerceData.products.centroSobremesaPudim,
        productName: "Pudim",
        quantity: 2,
        unitPriceBrl: "7.50",
        totalPriceBrl: "15.00",
      },
    ],
    events: [
      {
        eventType: "order_created",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Pedido criado pelo comercio.",
        occurredAt: new Date("2026-02-13T19:00:00.000Z"),
      },
      {
        eventType: "rider_assigned",
        actorUserId: seedIds.users.admin,
        actorRole: "admin",
        note: "Rider alocado por lote de dispatch.",
        occurredAt: new Date("2026-02-13T19:04:00.000Z"),
      },
      {
        eventType: "rider_accepted",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider aceitou o pedido.",
        occurredAt: new Date("2026-02-13T19:06:00.000Z"),
      },
      {
        eventType: "rider_to_merchant",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider a caminho do comercio.",
        occurredAt: new Date("2026-02-13T19:10:00.000Z"),
      },
      {
        eventType: "rider_at_merchant",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider chegou ao comercio.",
        occurredAt: new Date("2026-02-13T19:15:00.000Z"),
      },
      {
        eventType: "waiting_order",
        actorUserId: seedIds.users.commerceCentro,
        actorRole: "commerce",
        note: "Comercio finalizando separacao do pedido.",
        occurredAt: new Date("2026-02-13T19:18:00.000Z"),
      },
      {
        eventType: "rider_to_customer",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider saiu para o cliente.",
        occurredAt: new Date("2026-02-13T19:24:00.000Z"),
      },
      {
        eventType: "rider_at_customer",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider chegou ao cliente.",
        occurredAt: new Date("2026-02-13T19:33:00.000Z"),
      },
      {
        eventType: "finishing_delivery",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Rider validando confirmacao de entrega.",
        occurredAt: new Date("2026-02-13T19:39:00.000Z"),
      },
      {
        eventType: "completed",
        actorUserId: seedIds.users.riderJoao,
        actorRole: "rider",
        note: "Entrega concluida com sucesso.",
        occurredAt: new Date("2026-02-13T19:42:00.000Z"),
      },
    ],
  },
];

export async function seedOrdersTracking({ prisma }: SeedContext): Promise<void> {
  for (const orderSeed of ORDER_SEEDS) {
    const order = await prisma.orders.upsert({
      where: { order_code: orderSeed.orderCode },
      update: {
        commerce_user_id: orderSeed.commerceUserId,
        rider_user_id: orderSeed.riderUserId,
        client_id: orderSeed.clientId,
        status: orderSeed.status,
        urgency: orderSeed.urgency,
        origin_bairro_id: orderSeed.originBairroId,
        destination_bairro_id: orderSeed.destinationBairroId,
        recipient_name: orderSeed.recipientName,
        recipient_phone: orderSeed.recipientPhone,
        destination_cep: orderSeed.destinationCep,
        destination_state: orderSeed.destinationState,
        destination_city: orderSeed.destinationCity,
        destination_neighborhood: orderSeed.destinationNeighborhood,
        destination_street: orderSeed.destinationStreet,
        destination_number: orderSeed.destinationNumber,
        destination_complement: orderSeed.destinationComplement,
        notes: orderSeed.notes,
        distance_m: orderSeed.distanceM,
        duration_s: orderSeed.durationS,
        eta_min: orderSeed.etaMin,
        zone: orderSeed.zone,
        base_zone_brl: orderSeed.baseZoneBrl,
        urgency_brl: orderSeed.urgencyBrl,
        sunday_brl: orderSeed.sundayBrl,
        holiday_brl: orderSeed.holidayBrl,
        rain_brl: orderSeed.rainBrl,
        peak_brl: orderSeed.peakBrl,
        total_brl: orderSeed.totalBrl,
        confirmation_code_required: false,
        accepted_at: orderSeed.acceptedAt,
        completed_at: orderSeed.completedAt,
        canceled_at: null,
        cancel_reason: null,
        created_at: orderSeed.createdAt,
      },
      create: {
        id: orderSeed.id,
        order_code: orderSeed.orderCode,
        commerce_user_id: orderSeed.commerceUserId,
        rider_user_id: orderSeed.riderUserId,
        client_id: orderSeed.clientId,
        status: orderSeed.status,
        urgency: orderSeed.urgency,
        origin_bairro_id: orderSeed.originBairroId,
        destination_bairro_id: orderSeed.destinationBairroId,
        recipient_name: orderSeed.recipientName,
        recipient_phone: orderSeed.recipientPhone,
        destination_cep: orderSeed.destinationCep,
        destination_state: orderSeed.destinationState,
        destination_city: orderSeed.destinationCity,
        destination_neighborhood: orderSeed.destinationNeighborhood,
        destination_street: orderSeed.destinationStreet,
        destination_number: orderSeed.destinationNumber,
        destination_complement: orderSeed.destinationComplement,
        notes: orderSeed.notes,
        distance_m: orderSeed.distanceM,
        duration_s: orderSeed.durationS,
        eta_min: orderSeed.etaMin,
        zone: orderSeed.zone,
        base_zone_brl: orderSeed.baseZoneBrl,
        urgency_brl: orderSeed.urgencyBrl,
        sunday_brl: orderSeed.sundayBrl,
        holiday_brl: orderSeed.holidayBrl,
        rain_brl: orderSeed.rainBrl,
        peak_brl: orderSeed.peakBrl,
        total_brl: orderSeed.totalBrl,
        confirmation_code_required: false,
        accepted_at: orderSeed.acceptedAt,
        completed_at: orderSeed.completedAt,
        created_at: orderSeed.createdAt,
      },
    });

    await prisma.order_product_snapshots.deleteMany({
      where: { order_id: order.id },
    });

    for (const snapshot of orderSeed.snapshots) {
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

    for (const event of orderSeed.events) {
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
}
