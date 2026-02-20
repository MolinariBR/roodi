import Link from "next/link";

export const metadata = {
  title: "Para comerciantes",
  description:
    "Chame riders sob demanda, acompanhe cada etapa e pague por entrega. Operação previsível para o seu comércio.",
};

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Cotação previsível",
    description: "Preço e ETA calculados por matriz de bairros com fallback determinístico. Você sabe o valor antes de confirmar.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Tracking por estados",
    description: "Timeline operacional com eventos reais. Sem depender de GPS contínuo — cada etapa tem dono e momento claro.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Cadastros reutilizáveis",
    description: "Clientes e produtos organizados para acelerar novos chamados. Menos digitação, menos erro, mais velocidade.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Pagamento por chamado",
    description: "Sem mensalidade, sem surpresa. Você paga por entrega realizada. Checkout, webhook e conciliação automáticos.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Operação enxuta",
    description: "App único para comércio e rider, com navegação objetiva e poucas telas. Sem complexidade desnecessária.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Governança de preço",
    description: "Regras admin_only para zona, urgência e acréscimos. Preço justo e transparente para todos os envolvidos.",
  },
];

const metrics = [
  { value: "< 30s", label: "Cotação" },
  { value: "R$ 0", label: "Mensalidade" },
  { value: "100%", label: "Rastreável" },
  { value: "1 app", label: "Operação" },
];

export default function ParaComerciantesPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                Para comerciantes
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
                Entrega sob demanda com{" "}
                <span className="gradient-text">controle total</span>.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Abra um chamado em segundos, pague por entrega e acompanhe a timeline operacional em tempo real. Sem estado ambíguo. Sem surpresas.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contato?type=commerce" className="btn-primary">
                  Quero usar no meu negócio →
                </Link>
                <Link href="/como-funciona" className="btn-secondary">
                  Ver o fluxo
                </Link>
              </div>
            </div>

            {/* Metrics strip */}
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="glass-panel rounded-2xl p-6 text-center">
                  <p className="text-2xl font-extrabold tracking-tight gradient-text">{m.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="text-center">
            <p className="section-label">Benefícios</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
              Menos fricção.{" "}
              <span className="text-muted">Mais previsibilidade.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
              Cada etapa é clara e tem efeitos auditáveis — pagamento, dispatch e confirmação.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <article key={b.title} className="feature-card glass-panel rounded-2xl p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {b.icon}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{b.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-12">
                <p className="section-label">Na prática</p>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl" style={{ letterSpacing: "-0.03em" }}>
                  3 passos para sua primeira entrega.
                </h2>
                <ol className="mt-8 space-y-6">
                  {[
                    { n: "1", text: "Crie o chamado com cliente, destino e urgência" },
                    { n: "2", text: "Confirme a cotação e pague pelo checkout" },
                    { n: "3", text: "Acompanhe a timeline até a confirmação" },
                  ].map((s) => (
                    <li key={s.n} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">{s.n}</span>
                      <p className="text-base text-muted pt-0.5">{s.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex items-center justify-center border-t border-white/[0.06] bg-white/[0.02] p-10 md:border-l md:border-t-0 md:p-12">
                <div className="text-center">
                  <p className="text-5xl font-extrabold gradient-text">2min</p>
                  <p className="mt-2 text-sm text-muted">Do chamado ao rider a caminho</p>
                  <Link href="/como-funciona" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:brightness-110">
                    Ver fluxo completo →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl" style={{ letterSpacing: "-0.03em" }}>
            Pronto para <span className="gradient-text">testar</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            Conte seu cenário — cidade, volume de entregas e tipo de operação — e retornamos com os próximos passos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contato?type=commerce" className="btn-primary">
              Entrar em contato →
            </Link>
            <Link href="/para-entregadores" className="btn-secondary">
              Sou entregador
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
