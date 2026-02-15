import Link from "next/link";
import type { AdminOrder, OrderStatus } from "@core/api-client/admin-api.server";
import { formatCurrencyBRL, formatDateTime } from "@core/shared/format";

type AdminOrdersTableProps = {
  orders: AdminOrder[];
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

const statusClassName: Record<OrderStatus, string> = {
  created: "bg-surface-2 text-muted",
  searching_rider: "bg-surface-2 text-info",
  rider_assigned: "bg-primary-soft text-primary",
  to_merchant: "bg-primary-soft text-primary",
  at_merchant: "bg-primary-soft text-primary",
  waiting_order: "bg-surface-2 text-warning",
  to_customer: "bg-primary-soft text-primary",
  at_customer: "bg-surface-2 text-warning",
  finishing_delivery: "bg-surface-2 text-warning",
  completed: "bg-primary-soft text-success",
  canceled: "bg-surface-2 text-danger",
};

const truncateId = (value: string): string => {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

export function AdminOrdersTable({ orders }: AdminOrdersTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2">
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2">Pedido</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Urgencia</th>
            <th className="px-3 py-2">Criado em</th>
            <th className="px-3 py-2">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-xs text-muted">{truncateId(order.id)}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClassName[order.status]}`}
                >
                  {statusLabel[order.status]}
                </span>
              </td>
              <td className="px-3 py-2 font-semibold text-foreground">
                {formatCurrencyBRL(order.total_brl)}
              </td>
              <td className="px-3 py-2 capitalize text-muted">{order.urgency}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(order.created_at)}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-surface-2"
                  >
                    Detalhe
                  </Link>
                  <Link
                    href={`/admin/tracking?orderId=${order.id}`}
                    className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-surface-2"
                  >
                    Tracking
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
