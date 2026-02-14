const steps = [
  "Comerciante cria o chamado com dados do cliente e tipo de urgencia.",
  "Rider recebe e aceita a solicitacao no fluxo operacional por estados.",
  "Comerciante acompanha timeline da entrega e status de confirmacao.",
  "Financeiro registra debito de creditos e repasse conforme regra da plataforma.",
];

export default function ComoFuncionaPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Como funciona</h2>
        <p className="max-w-3xl text-base text-muted">Fluxo operacional orientado por estado, com baixo atrito para comercio e rider.</p>
      </header>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-lg border border-border bg-surface-1 p-4">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {index + 1}
            </span>
            <p className="text-sm text-foreground">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
