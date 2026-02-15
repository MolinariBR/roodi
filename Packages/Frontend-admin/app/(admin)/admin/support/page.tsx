import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadAdminSupportTickets, saveAdminSupportTicket } from "@modules/support/application/admin-support.service";
import { AdminSupportTicketCard } from "@modules/support/presentation/admin-support-ticket-card";

type AdminSupportPageProps = {
  searchParams?: {
    page?: string;
    state?: string;
  };
};

async function updateSupportTicketAction(formData: FormData): Promise<void> {
  "use server";

  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const assignedTo = String(formData.get("assigned_to_user_id") ?? "").trim();

  const status =
    statusValue === "open" ||
    statusValue === "in_progress" ||
    statusValue === "resolved" ||
    statusValue === "closed"
      ? statusValue
      : undefined;

  const result = await saveAdminSupportTicket({
    ticketId,
    ...(status ? { status } : {}),
    ...(note ? { note } : {}),
    ...(assignedTo ? { assigned_to_user_id: assignedTo } : {}),
  });

  if (result.error) {
    redirect("/admin/support?state=error");
  }

  revalidatePath("/admin/support");
  redirect("/admin/support?state=success");
}

export default async function AdminSupportPage({
  searchParams,
}: AdminSupportPageProps): Promise<JSX.Element> {
  const pageValue = Number(searchParams?.page ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const state = searchParams?.state;
  const result = await loadAdminSupportTickets({
    page,
    limit: 20,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
        <p className="text-sm text-muted">
          Fila de chamados com atualização de status e responsável.
        </p>
      </header>

      {state === "success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Ticket atualizado com sucesso.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao atualizar ticket.
        </p>
      ) : null}
      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data?.data.map((ticket) => (
        <div key={ticket.id} className="space-y-3">
          <AdminSupportTicketCard ticket={ticket} />
          <form
            action={updateSupportTicketAction}
            className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-4"
          >
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </span>
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Assign (admin user id)
              </span>
              <input
                name="assigned_to_user_id"
                defaultValue={ticket.assigned_to?.id ?? ""}
                placeholder="UUID do admin responsável"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1 sm:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Nota interna
              </span>
              <input
                name="note"
                placeholder="Observacao opcional da operacao"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div className="flex items-end sm:col-span-1">
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Atualizar
              </button>
            </div>
          </form>
        </div>
      ))}

      {result.data && result.data.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum ticket encontrado.
        </p>
      ) : null}
    </section>
  );
}
