import Link from "next/link";
import type { AdminOrder, OrderStatus } from "@core/api-client/admin-api.server";
import {
  formatCurrencyBRL,
  formatDateTime,
  formatDistanceKm,
  formatDurationMinutes,
} from "@core/shared/format";

type AdminOrderDetailProps = {
  order: AdminOrder;
};

const statusLabel: Record<OrderStatus, string> = {
  created: "Criado",
  searching_rider: "Buscando rider",
  rider_assigned: "Rider alocado",
  to_merchant: "A caminho do comercio",
  at_merchant: "No comercio",
  waiting_order: "Aguardando pedido",
  to_customer: "A caminho do cliente",
  at_customer: "No cliente",
  finishing_delivery: "Finalizando",
  completed: "Concluido",
  canceled: "Cancelado",
};

type FieldProps = {
  label: string;
  value: string;
};

function Field({ label, value }: FieldProps): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function AdminOrderDetail({ order }: AdminOrderDetailProps): JSX.Element {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pedido {order.id}</h1>
          <p className="text-sm text-muted">Status atual: {statusLabel[order.status]}</p>
        </div>
        <Link
          href={`/admin/tracking?orderId=${order.id}`}
          className="rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-2"
        >
          Ver tracking
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Total" value={formatCurrencyBRL(order.total_brl)} />
        <Field label="Urgencia" value={order.urgency} />
        <Field label="Distancia" value={formatDistanceKm(order.distance_m)} />
        <Field label="Duracao" value={formatDurationMinutes(order.duration_s)} />
        <Field label="Criado em" value={formatDateTime(order.created_at)} />
        <Field label="Comercio" value={order.commerce_id} />
        <Field label="Rider" value={order.rider_id ?? "-"} />
        <Field label="Zona" value={typeof order.zone === "number" ? String(order.zone) : "-"} />
      </div>

      <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Composicao de preco</h2>
        <dl className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Base por zona</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.base_zone_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Urgencia</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.urgency_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Domingo</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.sunday_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Feriado</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.holiday_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Chuva</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.rain_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
            <dt>Pico</dt>
            <dd className="font-semibold text-foreground">
              {formatCurrencyBRL(order.price.peak_brl)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-primary-soft px-3 py-2 sm:col-span-2">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="text-base font-bold text-foreground">
              {formatCurrencyBRL(order.price.total_brl)}
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
