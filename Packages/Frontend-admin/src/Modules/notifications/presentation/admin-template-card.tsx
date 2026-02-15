import type { NotificationTemplate } from "@core/api-client/admin-api.server";

type AdminTemplateCardProps = {
  template: NotificationTemplate;
};

export function AdminTemplateCard({ template }: AdminTemplateCardProps): JSX.Element {
  return (
    <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{template.event_key}</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md bg-surface-2 px-2 py-1 text-muted">
            canal: {template.channel}
          </span>
          <span
            className={`rounded-md px-2 py-1 font-semibold ${
              template.active ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted"
            }`}
          >
            {template.active ? "ativo" : "inativo"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">Template ID: {template.id}</p>
      <p className="mt-2 text-sm text-foreground">Titulo: {template.title_template}</p>
      <p className="mt-1 text-sm text-muted">Corpo: {template.body_template}</p>
    </article>
  );
}
