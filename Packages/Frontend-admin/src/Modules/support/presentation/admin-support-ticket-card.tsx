import type { SupportTicket } from "@core/api-client/admin-api.server";
import { formatDateTime } from "@core/shared/format";

type AdminSupportTicketCardProps = {
  ticket: SupportTicket;
};

export function AdminSupportTicketCard({ ticket }: AdminSupportTicketCardProps): JSX.Element {
  return (
    <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{ticket.subject}</h3>
          <p className="mt-1 text-xs text-muted">#{ticket.id}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md bg-surface-2 px-2 py-1 text-muted">
            prioridade: {ticket.priority}
          </span>
          <span className="rounded-md bg-primary-soft px-2 py-1 text-primary">
            status: {ticket.status}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{ticket.description}</p>

      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
        <p>
          Criado por:{" "}
          <span className="font-semibold text-foreground">{ticket.created_by?.name ?? "-"}</span>
        </p>
        <p>
          Atribuido para:{" "}
          <span className="font-semibold text-foreground">{ticket.assigned_to?.name ?? "-"}</span>
        </p>
        <p>Criado em: {formatDateTime(ticket.created_at)}</p>
        <p>Atualizado em: {ticket.updated_at ? formatDateTime(ticket.updated_at) : "-"}</p>
      </div>
    </article>
  );
}
