import type { TrackingTimelineResponse } from "@core/api-client/admin-api.server";
import { formatDateTime } from "@core/shared/format";

type AdminTrackingTimelineProps = {
  events: TrackingTimelineResponse["data"];
};

const eventLabel: Record<string, string> = {
  order_created: "Pedido criado",
  rider_assigned: "Rider alocado",
  rider_accepted: "Rider aceitou",
  rider_to_merchant: "Rider a caminho do comercio",
  rider_at_merchant: "Rider chegou no comercio",
  waiting_order: "Aguardando pedido",
  rider_to_customer: "Rider a caminho do cliente",
  rider_at_customer: "Rider chegou no cliente",
  finishing_delivery: "Finalizando entrega",
  completed: "Entrega concluida",
  canceled: "Pedido cancelado",
};

const resolveEventLabel = (eventType: string): string => {
  return eventLabel[eventType] ?? eventType;
};

export function AdminTrackingTimeline({ events }: AdminTrackingTimelineProps): JSX.Element {
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {resolveEventLabel(event.event_type)}
            </p>
            <p className="text-xs text-muted">{formatDateTime(event.occurred_at)}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-md bg-surface-2 px-2 py-1">
              Actor: {event.actor_role ?? "-"}
            </span>
            <span className="rounded-md bg-surface-2 px-2 py-1">Event: {event.event_type}</span>
          </div>
          {event.note ? <p className="mt-2 text-sm text-muted">Nota: {event.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
