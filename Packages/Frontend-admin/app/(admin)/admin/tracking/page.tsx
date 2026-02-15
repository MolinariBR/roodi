import { getTrackingTimelineByOrderId } from "@modules/tracking/application/admin-tracking.service";
import { AdminTrackingTimeline } from "@modules/tracking/presentation/admin-tracking-timeline";

type AdminTrackingPageProps = {
  searchParams?: {
    orderId?: string;
  };
};

export default async function AdminTrackingPage({
  searchParams,
}: AdminTrackingPageProps): Promise<JSX.Element> {
  const orderId = searchParams?.orderId?.trim();
  const hasOrderId = Boolean(orderId);

  const result = hasOrderId
    ? await getTrackingTimelineByOrderId(orderId as string)
    : { data: null, error: null };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Tracking</h1>
        <p className="text-sm text-muted">
          Consulte a timeline de eventos informando o identificador do pedido.
        </p>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-[1fr_auto]">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Order ID</span>
          <input
            name="orderId"
            defaultValue={orderId ?? ""}
            placeholder="UUID do pedido"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Consultar
          </button>
        </div>
      </form>

      {hasOrderId && result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {hasOrderId && !result.error && result.data && result.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum evento encontrado para este pedido.
        </p>
      ) : null}

      {result.data && result.data.length > 0 ? <AdminTrackingTimeline events={result.data} /> : null}
    </section>
  );
}
