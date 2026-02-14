const kpis = [
  { label: "Chamados ativos", value: "24" },
  { label: "Corridas hoje", value: "312" },
  { label: "Créditos pendentes", value: "R$ 1.840,00" },
];

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Shell inicial para os módulos administrativos do Roodi.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
            <p className="text-sm text-muted">{kpi.label}</p>
            <p className="mt-2 text-xl font-bold text-foreground">{kpi.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
