import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import type { Prisma } from "@prisma/client";

const NOW = new Date("2026-02-16T12:00:00.000Z");

type NotificationTemplateSeed = {
  id: string;
  eventKey: string;
  channel: "in_app" | "push";
  titleTemplate: string;
  bodyTemplate: string;
  templateVersion: number;
  active: boolean;
};

type NotificationSeed = {
  id: string;
  userId: string;
  eventKey: string;
  channel: "in_app" | "push";
  title: string;
  body: string;
  payload: Prisma.InputJsonValue;
  readAt: Date | null;
  createdAt: Date;
};

type FaqSeed = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
};

type TicketSeed = {
  id: string;
  createdByUserId: string;
  orderId: string | null;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedToUserId: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type TicketMessageSeed = {
  id: string;
  ticketId: string;
  authorUserId: string;
  message: string;
  internalNote: boolean;
  createdAt: Date;
};

const TEMPLATES: ReadonlyArray<NotificationTemplateSeed> = [
  {
    id: seedIds.notifications.templates.orderCreatedInApp,
    eventKey: "order.created",
    channel: "in_app",
    titleTemplate: "Novo pedido recebido",
    bodyTemplate: "Pedido {{order_code}} criado com sucesso.",
    templateVersion: 1,
    active: true,
  },
  {
    id: seedIds.notifications.templates.orderCreatedPush,
    eventKey: "order.created",
    channel: "push",
    titleTemplate: "Novo pedido",
    bodyTemplate: "Voce recebeu um novo pedido para despacho.",
    templateVersion: 1,
    active: true,
  },
  {
    id: seedIds.notifications.templates.orderStatusInApp,
    eventKey: "order.status_changed",
    channel: "in_app",
    titleTemplate: "Status atualizado",
    bodyTemplate: "Pedido {{order_code}} mudou para {{status}}.",
    templateVersion: 1,
    active: true,
  },
  {
    id: seedIds.notifications.templates.paymentApprovedInApp,
    eventKey: "payment.approved",
    channel: "in_app",
    titleTemplate: "Pagamento aprovado",
    bodyTemplate: "Credito de R$ {{amount}} confirmado na carteira.",
    templateVersion: 1,
    active: true,
  },
  {
    id: seedIds.notifications.templates.supportUpdatedInApp,
    eventKey: "support.ticket_updated",
    channel: "in_app",
    titleTemplate: "Ticket atualizado",
    bodyTemplate: "Ticket {{ticket_id}} recebeu atualizacao.",
    templateVersion: 1,
    active: true,
  },
];

const NOTIFICATIONS: ReadonlyArray<NotificationSeed> = [
  {
    id: seedIds.notifications.items.riderOfferPending,
    userId: seedIds.users.riderJoao,
    eventKey: "dispatch.offer_pending",
    channel: "in_app",
    title: "Nova oferta de entrega",
    body: "Voce recebeu uma oferta para o pedido ORD-DEV-0001.",
    payload: {
      order_id: seedIds.orders.searchingRider,
      offer_status: "pending",
    },
    readAt: null,
    createdAt: new Date("2026-02-16T11:55:00.000Z"),
  },
  {
    id: seedIds.notifications.items.riderOrderInProgress,
    userId: seedIds.users.riderMaria,
    eventKey: "order.status_changed",
    channel: "in_app",
    title: "Entrega em andamento",
    body: "Pedido ORD-DEV-0002 segue para o cliente.",
    payload: {
      order_id: seedIds.orders.toCustomer,
      status: "to_customer",
    },
    readAt: null,
    createdAt: new Date("2026-02-16T11:52:00.000Z"),
  },
  {
    id: seedIds.notifications.items.commerceOrderCreated,
    userId: seedIds.users.commerceCentro,
    eventKey: "order.created",
    channel: "in_app",
    title: "Pedido criado",
    body: "Seu pedido ORD-DEV-0001 foi enviado para dispatch.",
    payload: {
      order_id: seedIds.orders.searchingRider,
    },
    readAt: new Date("2026-02-16T11:51:00.000Z"),
    createdAt: new Date("2026-02-16T11:50:00.000Z"),
  },
  {
    id: seedIds.notifications.items.commercePaymentApproved,
    userId: seedIds.users.commerceCentro,
    eventKey: "payment.approved",
    channel: "in_app",
    title: "Credito aprovado",
    body: "Compra de R$ 100,00 aprovada via InfinitePay.",
    payload: {
      order_nsu: "NSU-DEV-0001",
      amount_brl: 100,
    },
    readAt: null,
    createdAt: new Date("2026-02-16T11:49:00.000Z"),
  },
  {
    id: seedIds.notifications.items.adminSupportOpened,
    userId: seedIds.users.admin,
    eventKey: "support.ticket_opened",
    channel: "in_app",
    title: "Novo ticket de suporte",
    body: "Ticket de prioridade alta aguardando triagem.",
    payload: {
      ticket_id: seedIds.support.tickets.commerceLateDelivery,
    },
    readAt: null,
    createdAt: new Date("2026-02-16T11:48:00.000Z"),
  },
  {
    id: seedIds.notifications.items.adminSystemWarning,
    userId: seedIds.users.admin,
    eventKey: "system.warning",
    channel: "in_app",
    title: "Alerta operacional",
    body: "Fila de suporte com aumento de tickets abertos.",
    payload: {
      source: "support-monitor",
      severity: "medium",
    },
    readAt: new Date("2026-02-16T11:47:00.000Z"),
    createdAt: new Date("2026-02-16T11:46:00.000Z"),
  },
];

const FAQS: ReadonlyArray<FaqSeed> = [
  {
    id: seedIds.support.faqs.howToCallRider,
    question: "Como acionar um rider?",
    answer:
      "Na tela Home do comercio, toque em Chamar Rider e confirme os dados da entrega.",
    category: "commerce",
    sortOrder: 1,
    active: true,
  },
  {
    id: seedIds.support.faqs.riderNoShow,
    question: "O que fazer quando o rider nao aparece?",
    answer:
      "Acompanhe o status do pedido. Se ultrapassar o tempo estimado, abra um ticket na Central de Ajuda.",
    category: "commerce",
    sortOrder: 2,
    active: true,
  },
  {
    id: seedIds.support.faqs.paymentDelay,
    question: "Quanto tempo leva para o credito cair?",
    answer:
      "Compras aprovadas por PIX aparecem quase em tempo real. Cartao pode levar alguns minutos.",
    category: "financeiro",
    sortOrder: 3,
    active: true,
  },
  {
    id: seedIds.support.faqs.updateDocuments,
    question: "Como atualizar documentos do rider?",
    answer:
      "No perfil do rider, abra a secao Documentos e envie o novo arquivo para validacao.",
    category: "rider",
    sortOrder: 4,
    active: true,
  },
];

const TICKETS: ReadonlyArray<TicketSeed> = [
  {
    id: seedIds.support.tickets.commerceLateDelivery,
    createdByUserId: seedIds.users.commerceCentro,
    orderId: seedIds.orders.toCustomer,
    subject: "Atraso na entrega em andamento",
    description:
      "Pedido em rota para cliente e ETA ultrapassou o previsto no painel.",
    status: "in_progress",
    priority: "high",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T10:40:00.000Z"),
    updatedAt: new Date("2026-02-16T11:20:00.000Z"),
  },
  {
    id: seedIds.support.tickets.riderAddressIssue,
    createdByUserId: seedIds.users.riderMaria,
    orderId: seedIds.orders.toCustomer,
    subject: "Endereco incompleto do cliente",
    description: "Numero da residencia ausente no destino. Necessario contato.",
    status: "open",
    priority: "medium",
    assignedToUserId: null,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T11:00:00.000Z"),
    updatedAt: new Date("2026-02-16T11:00:00.000Z"),
  },
  {
    id: seedIds.support.tickets.commercePaymentReconcile,
    createdByUserId: seedIds.users.commerceFarmacia,
    orderId: seedIds.orders.completed,
    subject: "Conferencia de debito da corrida",
    description:
      "Solicito detalhamento do debito aplicado apos entrega concluida.",
    status: "resolved",
    priority: "low",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: new Date("2026-02-16T09:15:00.000Z"),
    createdAt: new Date("2026-02-16T08:45:00.000Z"),
    updatedAt: new Date("2026-02-16T09:15:00.000Z"),
  },
  {
    id: seedIds.support.tickets.commerceClientNotFound,
    createdByUserId: seedIds.users.commerceCentro,
    orderId: seedIds.orders.searchingRider,
    subject: "Cliente nao encontrado no endereco",
    description:
      "Cliente nao respondeu no interfone informado no cadastro.",
    status: "open",
    priority: "medium",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T10:15:00.000Z"),
    updatedAt: new Date("2026-02-16T10:22:00.000Z"),
  },
  {
    id: seedIds.support.tickets.riderAppCrash,
    createdByUserId: seedIds.users.riderJoao,
    orderId: null,
    subject: "App fecha ao abrir pedidos",
    description: "Ao abrir a lista de pedidos, o app encerra inesperadamente.",
    status: "in_progress",
    priority: "high",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T08:20:00.000Z"),
    updatedAt: new Date("2026-02-16T09:05:00.000Z"),
  },
  {
    id: seedIds.support.tickets.commerceDoubleCharge,
    createdByUserId: seedIds.users.commerceFarmacia,
    orderId: seedIds.orders.completed,
    subject: "Suspeita de cobranca duplicada",
    description:
      "Historico mostra dois lancamentos para a mesma corrida finalizada.",
    status: "resolved",
    priority: "urgent",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: new Date("2026-02-16T07:40:00.000Z"),
    createdAt: new Date("2026-02-16T07:00:00.000Z"),
    updatedAt: new Date("2026-02-16T07:40:00.000Z"),
  },
  {
    id: seedIds.support.tickets.riderUnsafeRoute,
    createdByUserId: seedIds.users.riderPedro,
    orderId: seedIds.orders.toCustomer,
    subject: "Sugestao de rota com risco alto",
    description:
      "Rota sugerida passou por area de baixa seguranca em horario noturno.",
    status: "closed",
    priority: "low",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: new Date("2026-02-15T23:50:00.000Z"),
    createdAt: new Date("2026-02-15T22:40:00.000Z"),
    updatedAt: new Date("2026-02-15T23:50:00.000Z"),
  },
  {
    id: seedIds.support.tickets.commerceMissingProduct,
    createdByUserId: seedIds.users.commerceCentro,
    orderId: null,
    subject: "Produto ausente no catalogo",
    description:
      "Item recem criado no cadastro nao aparece na tela de chamada de entrega.",
    status: "open",
    priority: "medium",
    assignedToUserId: null,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T11:30:00.000Z"),
    updatedAt: new Date("2026-02-16T11:30:00.000Z"),
  },
  {
    id: seedIds.support.tickets.riderDocumentReview,
    createdByUserId: seedIds.users.riderMaria,
    orderId: null,
    subject: "Validacao de documento pendente",
    description:
      "Documento enviado ha mais de 24h sem retorno de aprovacao.",
    status: "in_progress",
    priority: "low",
    assignedToUserId: seedIds.users.admin,
    resolvedAt: null,
    createdAt: new Date("2026-02-16T06:40:00.000Z"),
    updatedAt: new Date("2026-02-16T08:00:00.000Z"),
  },
];

const TICKET_MESSAGES: ReadonlyArray<TicketMessageSeed> = [
  {
    id: seedIds.support.messages.ticket1AdminNote,
    ticketId: seedIds.support.tickets.commerceLateDelivery,
    authorUserId: seedIds.users.admin,
    message: "Dispatch revisado. Rider notificado para atualizar status.",
    internalNote: true,
    createdAt: new Date("2026-02-16T11:20:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket2AdminNote,
    ticketId: seedIds.support.tickets.riderAddressIssue,
    authorUserId: seedIds.users.admin,
    message: "Contato do cliente solicitado ao comercio de origem.",
    internalNote: true,
    createdAt: new Date("2026-02-16T11:10:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket3AdminNote,
    ticketId: seedIds.support.tickets.commercePaymentReconcile,
    authorUserId: seedIds.users.admin,
    message: "Detalhamento financeiro enviado ao comerciante por notificacao.",
    internalNote: true,
    createdAt: new Date("2026-02-16T09:10:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket4AdminNote,
    ticketId: seedIds.support.tickets.commerceClientNotFound,
    authorUserId: seedIds.users.admin,
    message: "Solicitado novo ponto de referencia ao comerciante.",
    internalNote: true,
    createdAt: new Date("2026-02-16T10:21:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket5AdminNote,
    ticketId: seedIds.support.tickets.riderAppCrash,
    authorUserId: seedIds.users.admin,
    message: "Erro reproduzido em build debug e enviado para engenharia mobile.",
    internalNote: true,
    createdAt: new Date("2026-02-16T09:00:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket6AdminNote,
    ticketId: seedIds.support.tickets.commerceDoubleCharge,
    authorUserId: seedIds.users.admin,
    message:
      "Conferencia concluida: um dos lancamentos era reserva, nao cobranca final.",
    internalNote: true,
    createdAt: new Date("2026-02-16T07:38:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket7AdminNote,
    ticketId: seedIds.support.tickets.riderUnsafeRoute,
    authorUserId: seedIds.users.admin,
    message: "Rota alternativa marcada como preferencial para esse corredor.",
    internalNote: true,
    createdAt: new Date("2026-02-15T23:40:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket8AdminNote,
    ticketId: seedIds.support.tickets.commerceMissingProduct,
    authorUserId: seedIds.users.admin,
    message:
      "Cache de catalogo invalidado manualmente para sincronizacao imediata.",
    internalNote: true,
    createdAt: new Date("2026-02-16T11:33:00.000Z"),
  },
  {
    id: seedIds.support.messages.ticket9AdminNote,
    ticketId: seedIds.support.tickets.riderDocumentReview,
    authorUserId: seedIds.users.admin,
    message:
      "Documento em fila de analise. Previsao de aprovacao ate o fim do dia.",
    internalNote: true,
    createdAt: new Date("2026-02-16T07:55:00.000Z"),
  },
];

export async function seedNotificationsSupport({
  prisma,
}: SeedContext): Promise<void> {
  for (const template of TEMPLATES) {
    await prisma.notification_templates.upsert({
      where: { id: template.id },
      update: {
        event_key: template.eventKey,
        channel: template.channel,
        title_template: template.titleTemplate,
        body_template: template.bodyTemplate,
        template_version: template.templateVersion,
        active: template.active,
        updated_by_user_id: seedIds.users.admin,
        updated_at: NOW,
      },
      create: {
        id: template.id,
        event_key: template.eventKey,
        channel: template.channel,
        title_template: template.titleTemplate,
        body_template: template.bodyTemplate,
        template_version: template.templateVersion,
        active: template.active,
        updated_by_user_id: seedIds.users.admin,
        created_at: NOW,
        updated_at: NOW,
      },
    });
  }

  for (const item of NOTIFICATIONS) {
    await prisma.notifications.upsert({
      where: { id: item.id },
      update: {
        user_id: item.userId,
        event_key: item.eventKey,
        channel: item.channel,
        title: item.title,
        body: item.body,
        payload: item.payload,
        read_at: item.readAt,
        created_at: item.createdAt,
      },
      create: {
        id: item.id,
        user_id: item.userId,
        event_key: item.eventKey,
        channel: item.channel,
        title: item.title,
        body: item.body,
        payload: item.payload,
        read_at: item.readAt,
        created_at: item.createdAt,
      },
    });
  }

  for (const faq of FAQS) {
    await prisma.support_faqs.upsert({
      where: { id: faq.id },
      update: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sort_order: faq.sortOrder,
        active: faq.active,
        updated_by_user_id: seedIds.users.admin,
        updated_at: NOW,
      },
      create: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sort_order: faq.sortOrder,
        active: faq.active,
        updated_by_user_id: seedIds.users.admin,
        created_at: NOW,
        updated_at: NOW,
      },
    });
  }

  for (const ticket of TICKETS) {
    await prisma.support_tickets.upsert({
      where: { id: ticket.id },
      update: {
        created_by_user_id: ticket.createdByUserId,
        order_id: ticket.orderId,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigned_to_user_id: ticket.assignedToUserId,
        resolved_at: ticket.resolvedAt,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
      },
      create: {
        id: ticket.id,
        created_by_user_id: ticket.createdByUserId,
        order_id: ticket.orderId,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigned_to_user_id: ticket.assignedToUserId,
        resolved_at: ticket.resolvedAt,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
      },
    });
  }

  for (const message of TICKET_MESSAGES) {
    await prisma.support_ticket_messages.upsert({
      where: { id: message.id },
      update: {
        ticket_id: message.ticketId,
        author_user_id: message.authorUserId,
        message: message.message,
        internal_note: message.internalNote,
        created_at: message.createdAt,
      },
      create: {
        id: message.id,
        ticket_id: message.ticketId,
        author_user_id: message.authorUserId,
        message: message.message,
        internal_note: message.internalNote,
        created_at: message.createdAt,
      },
    });
  }
}
