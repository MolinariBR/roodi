import { loadDashboard } from "@modules/dashboard/application/dashboard.service";
import { DashboardKpiGrid } from "@modules/dashboard/presentation/dashboard-kpi-grid";

export default async function AdminDashboardPage() {
  const result = await loadDashboard();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">
          Visao operacional em tempo real para monitoramento administrativo.
        </p>
      </header>

      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data ? <DashboardKpiGrid data={result.data} /> : null}
    </section>
  );
}
