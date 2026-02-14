import type { notification_templates, notifications } from "@prisma/client";

import { AppError } from "@core/http/errors/app-error";
import type {
  NotificationListQuery,
  NotificationTemplateUpdateRequest,
} from "@modules/notifications/domain/notifications.schemas";
import { NotificationsRepository } from "@modules/notifications/infra/notifications.repository";

const toNotificationItem = (notification: notifications): Record<string, unknown> => {
  const payload = notification.payload;
  const data =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : undefined;

  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    read: notification.read_at !== null,
    created_at: notification.created_at.toISOString(),
    ...(data ? { data } : {}),
  };
};

const toNotificationTemplate = (template: notification_templates): Record<string, unknown> => {
  return {
    id: template.id,
    event_key: template.event_key,
    channel: template.channel,
    title_template: template.title_template,
    body_template: template.body_template,
    active: template.active,
  };
};

export class NotificationsService {
  constructor(private readonly notificationsRepository = new NotificationsRepository()) {}

  public async listNotifications(
    userId: string,
    query: NotificationListQuery,
  ): Promise<{
    success: true;
    data: Record<string, unknown>[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const { items, total } = await this.notificationsRepository.listUserNotifications(
      userId,
      query,
    );

    return {
      success: true,
      data: items.map(toNotificationItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: total > 0 ? Math.ceil(total / query.limit) : 0,
      },
    };
  }

  public async markNotificationRead(
    userId: string,
    notificationId: string,
  ): Promise<Record<string, unknown>> {
    const updatedNotification = await this.notificationsRepository.markNotificationRead(
      notificationId,
      userId,
    );

    if (!updatedNotification) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Notification not found.",
        statusCode: 404,
      });
    }

    return toNotificationItem(updatedNotification);
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllNotificationsRead(userId);
  }

  public async listNotificationTemplates(): Promise<{
    success: true;
    data: Record<string, unknown>[];
  }> {
    const templates = await this.notificationsRepository.listLatestTemplates();

    return {
      success: true,
      data: templates.map(toNotificationTemplate),
    };
  }

  public async updateNotificationTemplate(input: {
    templateId: string;
    payload: NotificationTemplateUpdateRequest;
    adminUserId: string;
  }): Promise<Record<string, unknown>> {
    const updated = await this.notificationsRepository.updateTemplateById({
      templateId: input.templateId,
      titleTemplate: input.payload.title_template,
      bodyTemplate: input.payload.body_template,
      active: input.payload.active,
      updatedByUserId: input.adminUserId,
    });

    if (!updated) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Notification template not found.",
        statusCode: 404,
      });
    }

    return toNotificationTemplate(updated);
  }
}
