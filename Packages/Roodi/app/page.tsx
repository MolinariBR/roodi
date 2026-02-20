import Link from "next/link";

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

const features = [
  {
    title: "Sem algoritmo secreto",
    description:
      "Regras públicas, rodízio por zona e decisões explicáveis. Tudo registrado em log.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Tracking por estados",
    description:
      "Timeline de eventos reais. Cada etapa tem dono, momento e efeito operacional claro.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Privacidade por design",
    description:
      "Sem GPS contínuo no fluxo principal. O tracking é por eventos, não por localização.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Justiça na alocação",
    description:
      "Oferta em lotes com janela curta. Rodízio + aptidão. Recusa é direito, abuso tem custo.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    title: "Financeiro rastreável",
    description:
      "Pagamento por chamado, webhook confirmado. O comércio sabe quanto paga, o rider sabe quanto recebe.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Governança real",
    description:
      "Preço é admin_only. Logs e auditoria sustentam suporte, disputa e evolução da plataforma.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Criação do chamado",
    description:
      "O comércio informa o cliente, destino e urgência. A cotação retorna preço e tempo estimado em segundos.",
  },
  {
    number: "02",
    title: "Confirmação de pagamento",
    description:
      "Checkout gerado automaticamente. O webhook confirma o pagamento e libera o dispatch para os riders.",
  },
  {
    number: "03",
    title: "Execução por estados",
    description:
      "O rider aceita, segue a timeline de estados operacionais e finaliza com código de confirmação.",
  },
  {
    number: "04",
    title: "Fechamento e auditoria",
    description:
      "Histórico completo, tracking por eventos e financeiro com trilha auditável de ponta a ponta.",
  },
];

const metrics = [
  { value: "< 30s", label: "Cotação" },
  { value: "12–15s", label: "Janela de oferta" },
  { value: "R$ 7+", label: "Preço mínimo" },
  { value: "100%", label: "Auditável" },
];

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="w-full">
      {/* ─── HERO ──────────────────────────────── */}
      <section className="relative overflow-hidden noise-overlay hero-glow">
        <div className="absolute inset-0 dot-grid" aria-hidden="true" />

        <div className="container-main relative z-10 section-spacing" style={{ paddingTop: 'clamp(100px, 14vw, 180px)', paddingBottom: 'clamp(80px, 10vw, 140px)' }}>
          <div className="mx-auto" style={{ maxWidth: 840 }}>
            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
              <span className="tag">
                <span className="tag-dot animate-pulse-dot" style={{ background: 'var(--color-success)' }} />
                Plataforma operacional
              </span>
              <span className="tag">
                <span className="tag-dot" style={{ background: 'var(--color-warning)' }} />
                Delivery em breve
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-balance animate-fade-in-up delay-100"
              style={{
                marginTop: 32,
                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.04em',
                textAlign: 'center',
              }}
            >
              Entregas sob demanda{' '}
              <span className="gradient-text">com transparência total</span>.
            </h1>

            {/* Sub-headline */}
            <p
              className="animate-fade-in-up delay-200"
              style={{
                marginTop: 24,
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
                fontSize: 'clamp(1rem, 1.5vw, 1.175rem)',
                lineHeight: 1.7,
                color: 'var(--color-muted)',
              }}
            >
              Comércio cria o chamado e acompanha cada etapa. Rider recebe ofertas justas e opera com clareza. Sem algoritmo secreto.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-300"
              style={{ marginTop: 40 }}
            >
              <Link href="/para-comerciantes" className="btn-primary">
                Sou comerciante
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/para-entregadores" className="btn-secondary">
                Sou entregador
              </Link>
            </div>

            {/* Metrics strip */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up delay-400"
              style={{ marginTop: 56 }}
            >
              {metrics.map((m, i) => (
                <div key={m.label} className="text-center">
                  <p
                    className="gradient-text"
                    style={{
                      fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {m.value}
                  </p>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--color-muted)',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── FEATURES ──────────────────────────── */}
      <section className="section-spacing noise-overlay">
        <div className="container-main">
          {/* Section header */}
          <div className="mx-auto animate-fade-in-up" style={{ maxWidth: 600, textAlign: 'center' }}>
            <p
              className="gradient-text"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Por que Roodi
            </p>
            <h2
              style={{
                marginTop: 16,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Menos atrito.{' '}
              <span style={{ color: 'var(--color-muted)' }}>Mais previsibilidade.</span>
            </h2>
            <p
              style={{
                marginTop: 16,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--color-muted)',
              }}
            >
              Fila e regras visíveis, tracking por estados e auditoria de ponta a ponta.
            </p>
          </div>

          {/* Feature grid */}
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            style={{ marginTop: 56 }}
          >
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`feature-card animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <div className="icon-box">{f.icon}</div>
                <h3
                  style={{
                    marginTop: 20,
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: 'var(--color-muted)',
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── HOW IT WORKS ──────────────────────── */}
      <section className="section-spacing noise-overlay">
        <div className="container-main">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left: header */}
            <div className="animate-fade-in-up" style={{ maxWidth: 480 }}>
              <p
                className="gradient-text"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Como funciona
              </p>
              <h2
                style={{
                  marginTop: 16,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}
              >
                Do chamado ao{' '}
                <span style={{ color: 'var(--color-muted)' }}>comprovante</span>.
              </h2>
              <p
                style={{
                  marginTop: 16,
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                }}
              >
                Velocidade e previsibilidade para o comércio. Clareza de estado e execução sem ruído para o rider.
              </p>
              <div style={{ marginTop: 32 }} className="flex flex-wrap gap-3">
                <Link href="/como-funciona" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '13px' }}>
                  Ver fluxo completo
                </Link>
              </div>
            </div>

            {/* Right: steps */}
            <div className="grid gap-6">
              {steps.map((s, i) => (
                <div
                  key={s.number}
                  className={`feature-card flex gap-5 animate-fade-in-up delay-${(i + 1) * 100}`}
                  style={{ padding: 24 }}
                >
                  <span className="step-number">{s.number}</span>
                  <div>
                    <h3
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: '0.8125rem',
                        lineHeight: 1.7,
                        color: 'var(--color-muted)',
                      }}
                    >
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── FOR WHO ───────────────────────────── */}
      <section className="section-spacing noise-overlay">
        <div className="container-main">
          {/* Section header */}
          <div className="mx-auto animate-fade-in-up" style={{ maxWidth: 600, textAlign: 'center' }}>
            <p
              className="gradient-text"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Para quem
            </p>
            <h2
              style={{
                marginTop: 16,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Dois perfis.{' '}
              <span style={{ color: 'var(--color-muted)' }}>Uma operação.</span>
            </h2>
          </div>

          {/* Cards */}
          <div
            className="grid gap-5 md:grid-cols-2"
            style={{ marginTop: 48 }}
          >
            {/* Commerce card */}
            <Link
              href="/para-comerciantes"
              className="group feature-card animate-fade-in-up delay-100"
              style={{ padding: '40px 36px' }}
            >
              <div
                className="icon-box"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                }}
              >
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p
                style={{
                  marginTop: 28,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                }}
              >
                Comércio
              </p>
              <h3
                style={{
                  marginTop: 8,
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                Chame um rider quando precisar.
              </h3>
              <p
                style={{
                  marginTop: 12,
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                }}
              >
                Abra chamado em segundos, acompanhe a timeline de estados e mantenha clientes e produtos organizados.
              </p>
              <span
                className="inline-flex items-center gap-2 transition-all duration-300 group-hover:gap-3"
                style={{
                  marginTop: 20,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                }}
              >
                Ver benefícios
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Rider card */}
            <Link
              href="/para-entregadores"
              className="group feature-card animate-fade-in-up delay-200"
              style={{ padding: '40px 36px' }}
            >
              <div
                className="icon-box"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                }}
              >
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p
                style={{
                  marginTop: 28,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                }}
              >
                Rider
              </p>
              <h3
                style={{
                  marginTop: 8,
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                Execute corridas com clareza.
              </h3>
              <p
                style={{
                  marginTop: 12,
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                }}
              >
                Receba ofertas justas, aceite, siga estados operacionais claros e finalize com código de confirmação.
              </p>
              <span
                className="inline-flex items-center gap-2 transition-all duration-300 group-hover:gap-3"
                style={{
                  marginTop: 20,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                }}
              >
                Ver benefícios
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── COMING SOON ───────────────────────── */}
      <section className="section-spacing noise-overlay">
        <div className="container-main">
          <div
            className="cta-card animate-fade-in-up"
            style={{ overflow: 'hidden' }}
          >
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <span className="tag" style={{ marginBottom: 20 }}>
                  <span className="tag-dot" style={{ background: 'var(--color-warning)' }} />
                  Em breve
                </span>
                <h2
                  style={{
                    marginTop: 16,
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Roodi também terá{' '}
                  <span className="gradient-text">delivery</span>.
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--color-muted)',
                    maxWidth: 440,
                  }}
                >
                  Além do chamado do comércio, estamos preparando uma experiência completa de delivery para o cliente final.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Cardápio e vitrine do comércio",
                  "Pagamento no checkout e confirmação automática",
                  "Acompanhamento por estados e comprovante",
                ].map((line, i) => (
                  <div
                    key={line}
                    className={`feature-card flex items-center gap-4 animate-fade-in-up delay-${(i + 1) * 100}`}
                    style={{ padding: '18px 20px' }}
                  >
                    <span
                      className="tag-dot"
                      style={{
                        background: 'var(--color-primary)',
                        width: 8,
                        height: 8,
                        flexShrink: 0,
                      }}
                    />
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── FINAL CTA ─────────────────────────── */}
      <section className="section-spacing noise-overlay hero-glow">
        <div className="container-main">
          <div
            className="mx-auto animate-fade-in-up"
            style={{ maxWidth: 640, textAlign: 'center' }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Quer participar{' '}
              <span className="gradient-text">do piloto</span>?
            </h2>
            <p
              style={{
                marginTop: 16,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--color-muted)',
              }}
            >
              Deixe um contato e o time entra em contato. Sem compromisso, sem spam.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4" style={{ marginTop: 32 }}>
              <Link href="/contato" className="btn-primary">
                Entrar em contato
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/como-funciona" className="btn-secondary" style={{ padding: '14px 28px' }}>
                Ver como funciona
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
