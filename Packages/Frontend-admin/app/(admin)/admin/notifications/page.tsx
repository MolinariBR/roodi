import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loadAdminNotificationTemplates,
  saveAdminNotificationTemplate,
} from "@modules/notifications/application/admin-notifications.service";
import { AdminTemplateCard } from "@modules/notifications/presentation/admin-template-card";

type AdminNotificationsPageProps = {
  searchParams?: {
    state?: string;
  };
};

async function updateTemplateAction(formData: FormData): Promise<void> {
  "use server";

  const templateId = String(formData.get("template_id") ?? "").trim();
  const titleTemplate = String(formData.get("title_template") ?? "").trim();
  const bodyTemplate = String(formData.get("body_template") ?? "").trim();
  const activeValue = String(formData.get("active") ?? "false");

  const result = await saveAdminNotificationTemplate({
    templateId,
    title_template: titleTemplate,
    body_template: bodyTemplate,
    active: activeValue === "true",
  });

  if (result.error) {
    redirect("/admin/notifications?state=error");
  }

  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?state=success");
}

export default async function AdminNotificationsPage({
  searchParams,
}: AdminNotificationsPageProps): Promise<JSX.Element> {
  const state = searchParams?.state;
  const result = await loadAdminNotificationTemplates();

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
        <p className="text-sm text-muted">Edição de templates por evento/canal.</p>
      </header>

      {state === "success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Template atualizado com sucesso.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao atualizar template.
        </p>
      ) : null}
      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data?.data.map((template) => (
        <div key={template.id} className="space-y-3">
          <AdminTemplateCard template={template} />
          <form
            action={updateTemplateAction}
            className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm"
          >
            <input type="hidden" name="template_id" value={template.id} />
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Título template
              </span>
              <input
                name="title_template"
                defaultValue={template.title_template}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Corpo template
              </span>
              <textarea
                name="body_template"
                rows={3}
                defaultValue={template.body_template}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                required
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="hidden" name="active" value="false" />
              <input
                type="checkbox"
                name="active"
                value="true"
                defaultChecked={template.active}
                className="h-4 w-4 rounded border-border"
              />
              Template ativo
            </label>
            <div>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Salvar template
              </button>
            </div>
          </form>
        </div>
      ))}

      {result.data && result.data.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum template encontrado.
        </p>
      ) : null}
    </section>
  );
}
