import Link from "next/link";

export const metadata = {
  title: "Para entregadores",
  description:
    "Receba ofertas justas, execute corridas com clareza de estado e finalize com código de confirmação.",
};

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Ofertas objetivas",
    description: "Aceite ou recuse com contexto completo — distância, valor e prioridade. Sem pegadinhas ou penalidades injustas.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Timeline operacional",
    description: "A entrega avança por estados claros: a caminho, chegou, aguardando, entregue. O card principal muda com você.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Confirmação segura",
    description: "Código de confirmação e evento de conclusão registrados. Sua entrega é comprovada e auditável.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Preço justo e visível",
    description: "Você sabe quanto vai receber antes de aceitar. Sem algoritmo secreto definindo seu ganho.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Rodízio justo",
    description: "Ofertas distribuídas por rodízio na zona + aptidão. Recusa é direito, mas abuso tem custo visível.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Histórico completo",
    description: "Todas as suas corridas, ganhos e eventos disponíveis no app. Transparência total sobre sua operação.",
  },
];

const operationSteps = [
  {
    number: "01",
    title: "Receba a oferta",
    description: "Você vê distância, valor e detalhes do chamado. Aceite ou recuse sem penalização injusta.",
  },
  {
    number: "02",
    title: "Execute por estados",
    description: "Cada etapa operacional é registrada — a caminho, chegou, coletou, entregou. Sem ambiguidade.",
  },
  {
    number: "03",
    title: "Finalize com código",
    description: "Código de confirmação valida a entrega. Histórico e financeiro ficam disponíveis imediatamente.",
  },
];

export default function ParaEntregadoresPage() {
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
                Para entregadores
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
                Execute corridas com{" "}
                <span className="gradient-text">clareza total</span>.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Receba ofertas justas, aceite com contexto completo, siga estados operacionais claros e finalize com código de confirmação. Sem ruído.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contato?type=rider" className="btn-primary">
                  Quero ser rider →
                </Link>
                <Link href="/como-funciona" className="btn-secondary">
                  Ver o fluxo
                </Link>
              </div>
            </div>

            {/* Operation flow preview */}
            <div className="space-y-4">
              {operationSteps.map((step) => (
                <div key={step.number} className="glass-panel flex items-start gap-4 rounded-2xl p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.description}</p>
                  </div>
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
              Estado atual{" "}
              <span className="text-muted">sempre visível</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
              O card principal muda por estado, sem espalhar a operação em múltiplas telas.
              Menos erro, mais velocidade.
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

      {/* Fairness highlight */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-12">
                <p className="section-label">Compromisso</p>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl" style={{ letterSpacing: "-0.03em" }}>
                  Justiça não é slogan.{" "}
                  <span className="text-muted">É regra auditável.</span>
                </h2>
                <ul className="mt-8 space-y-4">
                  {[
                    "Preço definido por regras públicas, sem algoritmo opaco",
                    "Rodízio por zona garante distribuição equilibrada",
                    "Recusa é direito — penalização só por abuso comprovado",
                    "Taxa da plataforma fixa e visível: R$ 1 por entrega",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />
                      <span className="text-sm text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center border-t border-white/[0.06] bg-white/[0.02] p-10 md:border-l md:border-t-0 md:p-12">
                <div className="text-center">
                  <p className="text-5xl font-extrabold gradient-text">R$ 1</p>
                  <p className="mt-2 text-sm text-muted">Taxa fixa da plataforma por entrega</p>
                  <p className="mt-1 text-xs text-muted/60">O restante é seu</p>
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
            Pronto para <span className="gradient-text">começar</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            Deixe um contato com sua cidade e disponibilidade. O time libera acesso e orienta os próximos passos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contato?type=rider" className="btn-primary">
              Quero ser rider →
            </Link>
            <Link href="/para-comerciantes" className="btn-secondary">
              Sou comerciante
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
