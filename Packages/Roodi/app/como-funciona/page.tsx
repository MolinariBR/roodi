import Link from "next/link";

export const metadata = {
  title: "Como funciona",
  description:
    "Do chamado ao comprovante em 4 etapas. Entenda o fluxo completo de entregas do Roodi.",
};

const steps = [
  {
    number: "01",
    title: "Criação do chamado",
    description:
      "O comércio informa cliente, destino e urgência. A cotação retorna preço e tempo estimado em segundos — sem surpresas.",
    detail: "Matriz de bairros + fallback determinístico",
  },
  {
    number: "02",
    title: "Confirmação de pagamento",
    description:
      "Checkout gerado automaticamente. O webhook confirma o pagamento e libera o dispatch para os riders disponíveis.",
    detail: "Pagamento por chamado, sem mensalidade",
  },
  {
    number: "03",
    title: "Execução por estados",
    description:
      "O rider aceita a oferta, segue a timeline operacional e finaliza com código de confirmação. Cada etapa tem dono e momento.",
    detail: "Timeline de eventos rastreável",
  },
  {
    number: "04",
    title: "Fechamento e auditoria",
    description:
      "Histórico completo, tracking por eventos e financeiro com trilha auditável de ponta a ponta. Tudo registrado.",
    detail: "Logs de auditoria completos",
  },
];

const principles = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Sem algoritmo secreto",
    description: "Regras públicas de preço e alocação. Rodízio por zona. Decisões explicáveis e auditáveis.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Operação em tempo real",
    description: "Cada transição de estado gera evento. Comércio e admin acompanham sem depender de GPS contínuo.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Privacidade por design",
    description: "Sem GPS contínuo no fluxo principal. O tracking é por eventos, não por localização.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="text-center">
            <p className="section-label">Como funciona</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl" style={{ letterSpacing: "-0.04em" }}>
              Do chamado ao{" "}
              <span className="gradient-text">comprovante</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              Um fluxo único com 4 etapas claras. Cada uma com dono, momento e efeito rastreável.
              Sem estados ambíguos. Sem surpresas operacionais.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/para-comerciantes" className="btn-primary">
                Sou comerciante →
              </Link>
              <Link href="/para-entregadores" className="btn-secondary">
                Sou entregador
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Steps */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="grid gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="glass-panel group relative grid gap-6 rounded-2xl p-8 transition-all duration-300 hover:border-[var(--color-primary)]/30 md:grid-cols-[80px_1fr_200px] md:items-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-2xl font-extrabold text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)]/20">
                  {step.number}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-base text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="text-center">
            <p className="section-label">Princípios</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
              Governança que você{" "}
              <span className="text-muted">pode verificar</span>.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <article key={p.title} className="feature-card glass-panel rounded-2xl p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl" style={{ letterSpacing: "-0.03em" }}>
            Quer ver o fluxo <span className="gradient-text">na prática</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            Fale com o time e agende uma demonstração do fluxo completo.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contato" className="btn-primary">
              Falar com o time →
            </Link>
            <Link href="/" className="btn-secondary">
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
