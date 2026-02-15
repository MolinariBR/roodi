import type { AdminDashboardData } from "@core/api-client/admin-api.server";
import { formatCurrencyBRL } from "@core/shared/format";

type DashboardKpiGridProps = {
  data: AdminDashboardData;
};

export function DashboardKpiGrid({ data }: DashboardKpiGridProps): JSX.Element {
  const kpis = [
    { label: "Pedidos ativos", value: String(data.active_orders) },
    { label: "Concluidos hoje", value: String(data.completed_today) },
    { label: "Cancelados hoje", value: String(data.canceled_today) },
    { label: "Volume bruto", value: formatCurrencyBRL(data.gross_volume_brl) },
    {
      label: "Comissao plataforma",
      value: formatCurrencyBRL(data.platform_commission_brl),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <article
          key={kpi.label}
          className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{kpi.label}</p>
          <p className="mt-2 text-xl font-bold text-foreground">{kpi.value}</p>
        </article>
      ))}
    </div>
  );
}
