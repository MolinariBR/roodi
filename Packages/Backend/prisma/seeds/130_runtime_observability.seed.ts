import type { SeedContext } from "./_shared/context";
import { seedIds } from "./_shared/ids";
import { Prisma } from "@prisma/client";

type AuditSeed = {
  requestId: string;
  actorUserId: string;
  actorRole: "admin" | "commerce" | "rider";
  action: string;
  entityType: string;
  entityId: string | null;
  beforeData: Prisma.InputJsonValue | null;
  afterData: Prisma.InputJsonValue | null;
  metadata: Prisma.InputJsonValue;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
};

const AUDIT_LOGS: ReadonlyArray<AuditSeed> = [
  {
    requestId: seedIds.observability.auditRequestIds.quoteCreated,
    actorUserId: seedIds.users.commerceCentro,
    actorRole: "commerce",
    action: "quote.create",
    entityType: "quotes",
    entityId: seedIds.quotes.successCentroBacuri,
    beforeData: null,
    afterData: {
      success: true,
      total_brl: "11.00",
      urgency: "padrao",
    },
    metadata: {
      endpoint: "/v1/commerce/quotes",
      source: "seed",
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0",
    createdAt: new Date("2026-02-16T12:05:00.000Z"),
  },
  {
    requestId: seedIds.observability.auditRequestIds.paymentApproved,
    actorUserId: seedIds.users.admin,
    actorRole: "admin",
    action: "payment.webhook.processed",
    entityType: "payment_webhook_events",
    entityId: null,
    beforeData: { processing_status: "received" },
    afterData: { processing_status: "processed" },
    metadata: {
      provider: "infinitepay",
      event_key: "payment.approved",
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0",
    createdAt: new Date("2026-02-16T12:06:00.000Z"),
  },
  {
    requestId: seedIds.observability.auditRequestIds.supportUpdate,
    actorUserId: seedIds.users.admin,
    actorRole: "admin",
    action: "support.ticket.update",
    entityType: "support_tickets",
    entityId: seedIds.support.tickets.commerceLateDelivery,
    beforeData: { status: "open" },
    afterData: { status: "in_progress" },
    metadata: {
      endpoint: "/v1/admin/support/tickets/{ticketId}",
      source: "seed",
    },
    ipAddress: "127.0.0.1",
    userAgent: "seed-script/1.0",
    createdAt: new Date("2026-02-16T12:07:00.000Z"),
  },
];

export async function seedRuntimeObservability({
  prisma,
}: SeedContext): Promise<void> {
  await prisma.auth_otp_challenges.upsert({
    where: { id: seedIds.observability.authOtpChallenges.riderJoaoReset },
    update: {
      user_id: seedIds.users.riderJoao,
      email: "rider.joao@roodi.app",
      otp_hash: "$2b$10$2n1crO/HYX9p0/Eiax4hcObGh4HaVBu/rO8MuqLxj4ksyb3mixKjq",
      challenge_type: "password_reset",
      max_attempts: 5,
      attempts: 2,
      resend_count: 1,
      expires_at: new Date("2026-02-16T12:20:00.000Z"),
      verified_at: new Date("2026-02-16T12:11:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
    create: {
      id: seedIds.observability.authOtpChallenges.riderJoaoReset,
      user_id: seedIds.users.riderJoao,
      email: "rider.joao@roodi.app",
      otp_hash: "$2b$10$2n1crO/HYX9p0/Eiax4hcObGh4HaVBu/rO8MuqLxj4ksyb3mixKjq",
      challenge_type: "password_reset",
      max_attempts: 5,
      attempts: 2,
      resend_count: 1,
      expires_at: new Date("2026-02-16T12:20:00.000Z"),
      verified_at: new Date("2026-02-16T12:11:00.000Z"),
      created_at: new Date("2026-02-16T12:00:00.000Z"),
    },
  });

  await prisma.auth_otp_challenges.upsert({
    where: { id: seedIds.observability.authOtpChallenges.commerceCentroReset },
    update: {
      user_id: seedIds.users.commerceCentro,
      email: "comercio.centro@roodi.app",
      otp_hash: "$2b$10$9LIB/Sd26Ezw6G1x/.npEe71w.bn0zrNhibR3UCQYsqOfQjcFWmgO",
      challenge_type: "password_reset",
      max_attempts: 5,
      attempts: 1,
      resend_count: 0,
      expires_at: new Date("2026-02-16T12:25:00.000Z"),
      verified_at: null,
      created_at: new Date("2026-02-16T12:03:00.000Z"),
    },
    create: {
      id: seedIds.observability.authOtpChallenges.commerceCentroReset,
      user_id: seedIds.users.commerceCentro,
      email: "comercio.centro@roodi.app",
      otp_hash: "$2b$10$9LIB/Sd26Ezw6G1x/.npEe71w.bn0zrNhibR3UCQYsqOfQjcFWmgO",
      challenge_type: "password_reset",
      max_attempts: 5,
      attempts: 1,
      resend_count: 0,
      expires_at: new Date("2026-02-16T12:25:00.000Z"),
      verified_at: null,
      created_at: new Date("2026-02-16T12:03:00.000Z"),
    },
  });

  await prisma.auth_otp_attempts.deleteMany({
    where: {
      challenge_id: {
        in: [
          seedIds.observability.authOtpChallenges.riderJoaoReset,
          seedIds.observability.authOtpChallenges.commerceCentroReset,
        ],
      },
    },
  });

  await prisma.auth_otp_attempts.createMany({
    data: [
      {
        challenge_id: seedIds.observability.authOtpChallenges.riderJoaoReset,
        attempted_code: "111111",
        success: false,
        ip_address: "127.0.0.1",
        user_agent: "seed-script/1.0",
        attempted_at: new Date("2026-02-16T12:04:00.000Z"),
      },
      {
        challenge_id: seedIds.observability.authOtpChallenges.riderJoaoReset,
        attempted_code: "654321",
        success: true,
        ip_address: "127.0.0.1",
        user_agent: "seed-script/1.0",
        attempted_at: new Date("2026-02-16T12:11:00.000Z"),
      },
      {
        challenge_id: seedIds.observability.authOtpChallenges.commerceCentroReset,
        attempted_code: "000000",
        success: false,
        ip_address: "127.0.0.1",
        user_agent: "seed-script/1.0",
        attempted_at: new Date("2026-02-16T12:06:00.000Z"),
      },
    ],
  });

  await prisma.auth_refresh_tokens.upsert({
    where: { jti: seedIds.observability.authRefreshJti.adminActive },
    update: {
      user_id: seedIds.users.admin,
      token_hash: "seed-refresh-hash-admin-active",
      issued_at: new Date("2026-02-16T11:00:00.000Z"),
      expires_at: new Date("2026-03-18T11:00:00.000Z"),
      revoked_at: null,
      revoked_reason: null,
      user_agent: "frontend-admin/dev",
      ip_address: "127.0.0.1",
      created_at: new Date("2026-02-16T11:00:00.000Z"),
    },
    create: {
      user_id: seedIds.users.admin,
      jti: seedIds.observability.authRefreshJti.adminActive,
      token_hash: "seed-refresh-hash-admin-active",
      issued_at: new Date("2026-02-16T11:00:00.000Z"),
      expires_at: new Date("2026-03-18T11:00:00.000Z"),
      revoked_at: null,
      revoked_reason: null,
      user_agent: "frontend-admin/dev",
      ip_address: "127.0.0.1",
      created_at: new Date("2026-02-16T11:00:00.000Z"),
    },
  });

  await prisma.auth_refresh_tokens.upsert({
    where: { jti: seedIds.observability.authRefreshJti.commerceRevoked },
    update: {
      user_id: seedIds.users.commerceCentro,
      token_hash: "seed-refresh-hash-commerce-revoked",
      issued_at: new Date("2026-02-16T08:00:00.000Z"),
      expires_at: new Date("2026-03-18T08:00:00.000Z"),
      revoked_at: new Date("2026-02-16T10:00:00.000Z"),
      revoked_reason: "logout",
      user_agent: "frontend-rider/dev",
      ip_address: "127.0.0.1",
      created_at: new Date("2026-02-16T08:00:00.000Z"),
    },
    create: {
      user_id: seedIds.users.commerceCentro,
      jti: seedIds.observability.authRefreshJti.commerceRevoked,
      token_hash: "seed-refresh-hash-commerce-revoked",
      issued_at: new Date("2026-02-16T08:00:00.000Z"),
      expires_at: new Date("2026-03-18T08:00:00.000Z"),
      revoked_at: new Date("2026-02-16T10:00:00.000Z"),
      revoked_reason: "logout",
      user_agent: "frontend-rider/dev",
      ip_address: "127.0.0.1",
      created_at: new Date("2026-02-16T08:00:00.000Z"),
    },
  });

  for (const log of AUDIT_LOGS) {
    const existing = await prisma.audit_logs.findFirst({
      where: {
        request_id: log.requestId,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.audit_logs.create({
        data: {
          request_id: log.requestId,
          actor_user_id: log.actorUserId,
          actor_role: log.actorRole,
          action: log.action,
          entity_type: log.entityType,
          entity_id: log.entityId,
          before_data: log.beforeData ?? Prisma.JsonNull,
          after_data: log.afterData ?? Prisma.JsonNull,
          metadata: log.metadata,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          created_at: log.createdAt,
        },
      });
    }
  }

  const runtimeHistoryExists = await prisma.system_runtime_history.findFirst({
    where: {
      maintenance_enabled: false,
      force_update_enabled: false,
      min_supported_app_version: "1.0.0",
      updated_by_user_id: seedIds.users.admin,
      created_at: new Date("2026-02-16T07:00:00.000Z"),
    },
    select: { id: true },
  });

  if (!runtimeHistoryExists) {
    await prisma.system_runtime_history.create({
      data: {
        maintenance_enabled: false,
        maintenance_message: null,
        expected_back_at: null,
        min_supported_app_version: "1.0.0",
        force_update_enabled: false,
        updated_by_user_id: seedIds.users.admin,
        created_at: new Date("2026-02-16T07:00:00.000Z"),
      },
    });
  }
}
