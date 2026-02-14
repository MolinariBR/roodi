import type { Prisma, PrismaClient, notification_templates, notifications } from "@prisma/client";

import { prisma as defaultPrisma } from "@core/database/prisma";
import type { NotificationListQuery } from "@modules/notifications/domain/notifications.schemas";

type ListNotificationsResult = {
  items: notifications[];
  total: number;
};

export class NotificationsRepository {
  constructor(private readonly prismaClient: PrismaClient = defaultPrisma) {}

  private buildStatusWhereClause(status: NotificationListQuery["status"]): Prisma.notificationsWhereInput {
    if (status === "read") {
      return { read_at: { not: null } };
    }

    if (status === "unread") {
      return { read_at: null };
    }

    return {};
  }

  public async listUserNotifications(
    userId: string,
    query: NotificationListQuery,
  ): Promise<ListNotificationsResult> {
    const where: Prisma.notificationsWhereInput = {
      user_id: userId,
      ...this.buildStatusWhereClause(query.status),
    };

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.notifications.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),
      this.prismaClient.notifications.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  public findNotificationByIdForUser(
    notificationId: string,
    userId: string,
  ): Promise<notifications | null> {
    return this.prismaClient.notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
  }

  public async markNotificationRead(
    notificationId: string,
    userId: string,
  ): Promise<notifications | null> {
    await this.prismaClient.notifications.updateMany({
      where: {
        id: notificationId,
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    return this.findNotificationByIdForUser(notificationId, userId);
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    await this.prismaClient.notifications.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });
  }

  public async listLatestTemplates(): Promise<notification_templates[]> {
    const templates = await this.prismaClient.notification_templates.findMany({
      orderBy: [{ event_key: "asc" }, { channel: "asc" }, { template_version: "desc" }],
    });

    const seen = new Set<string>();
    const latest: notification_templates[] = [];

    for (const template of templates) {
      const key = `${template.event_key}:${template.channel}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      latest.push(template);
    }

    return latest;
  }

  public async updateTemplateById(input: {
    templateId: string;
    titleTemplate: string;
    bodyTemplate: string;
    active: boolean;
    updatedByUserId: string;
  }): Promise<notification_templates | null> {
    const now = new Date();
    const updateResult = await this.prismaClient.notification_templates.updateMany({
      where: {
        id: input.templateId,
      },
      data: {
        title_template: input.titleTemplate,
        body_template: input.bodyTemplate,
        active: input.active,
        updated_by_user_id: input.updatedByUserId,
        updated_at: now,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.prismaClient.notification_templates.findUnique({
      where: {
        id: input.templateId,
      },
    });
  }
}
