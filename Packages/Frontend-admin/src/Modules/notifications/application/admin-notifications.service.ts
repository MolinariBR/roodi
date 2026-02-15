import {
  getAdminNotificationTemplates,
  updateAdminNotificationTemplate,
  type NotificationTemplate,
  type NotificationTemplateListResponse,
} from "@core/api-client/admin-api.server";

export const loadAdminNotificationTemplates = async (): Promise<{
  data: NotificationTemplateListResponse | null;
  error: string | null;
}> => {
  return getAdminNotificationTemplates();
};

export const saveAdminNotificationTemplate = async (input: {
  templateId: string;
  title_template: string;
  body_template: string;
  active: boolean;
}): Promise<{ data: NotificationTemplate | null; error: string | null }> => {
  return updateAdminNotificationTemplate(input);
};
