import Link from "next/link";

const steps = [
  {
    title: "1) Criar chamado",
    description: "Comerciante cria o chamado (cliente, destino e urgencia) e recebe cotacao com preco e ETA.",
  },
  {
    title: "2) Gerar checkout",
    description: "Pagamento por chamado: checkout e gerado e a confirmacao chega por webhook/consulta.",
  },
  {
    title: "3) Dispatch e execucao",
    description: "Rider recebe oferta, aceita/recusa e executa o fluxo operacional por estados.",
  },
  {
    title: "4) Tracking e fechamento",
    description: "Commerce acompanha timeline, confirmacao e historico. Admin audita eventos e financeiro.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-background roodi-noise">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div className="absolute inset-0 roodi-grid" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Como funciona</p>
            <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-6xl">
              Um fluxo unico: chamado, pagamento, execucao e comprovante.
            </h1>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              O app mobile e orientado por estados operacionais. O backend centraliza regras, auditoria e integracoes (pagamentos,
              webhooks e politicas de cotacao).
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/para-comerciantes"
                className="roodi-focus-ring inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
              >
                Ver para comerciantes
              </Link>
              <Link
                href="/para-entregadores"
                className="roodi-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
              >
                Ver para entregadores
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-muted transition-colors duration-fast hover:border-border hover:bg-surface-1 hover:text-foreground"
              >
                Falar com o time
              </Link>
            </div>
          </header>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <li key={step.title} className="roodi-panel rounded-3xl p-6">
              <p className="text-sm font-bold text-foreground">{step.title}</p>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
