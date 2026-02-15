import type { OrderStatus } from "@core/api-client/admin-api.server";
import { listAdminOrders } from "@modules/orders/application/admin-orders.service";
import { AdminOrdersTable } from "@modules/orders/presentation/admin-orders-table";

type AdminOrdersPageProps = {
  searchParams?: {
    status?: string;
    page?: string;
  };
};

const statusOptions: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: "created", label: "Criado" },
  { value: "searching_rider", label: "Buscando rider" },
  { value: "rider_assigned", label: "Rider alocado" },
  { value: "to_merchant", label: "A caminho do comercio" },
  { value: "at_merchant", label: "No comercio" },
  { value: "waiting_order", label: "Aguardando pedido" },
  { value: "to_customer", label: "A caminho do cliente" },
  { value: "at_customer", label: "No cliente" },
  { value: "finishing_delivery", label: "Finalizando entrega" },
  { value: "completed", label: "Concluido" },
  { value: "canceled", label: "Cancelado" },
];

const parseStatus = (value: string | undefined): OrderStatus | undefined => {
  const validValues: OrderStatus[] = [
    "created",
    "searching_rider",
    "rider_assigned",
    "to_merchant",
    "at_merchant",
    "waiting_order",
    "to_customer",
    "at_customer",
    "finishing_delivery",
    "completed",
    "canceled",
  ];

  if (value && validValues.includes(value as OrderStatus)) {
    return value as OrderStatus;
  }

  return undefined;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps): Promise<JSX.Element> {
  const pageValue = Number(searchParams?.page ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const status = parseStatus(searchParams?.status);

  const result = await listAdminOrders({
    page,
    limit: 20,
    status,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-sm text-muted">Lista e auditoria de pedidos com filtro por status.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-[1fr_auto]">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Filtrar
          </button>
        </div>
      </form>

      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {!result.error && result.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum pedido encontrado para o filtro informado.
        </p>
      ) : null}

      {result.data.length > 0 ? <AdminOrdersTable orders={result.data} /> : null}
    </section>
  );
}
