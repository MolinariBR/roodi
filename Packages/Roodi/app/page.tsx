import Link from "next/link";

const trustPillars = [
  {
    title: "Regras publicas",
    description: "Rodizio por zona, elegibilidade e efeitos operacionais registrados em log.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M7 7h10M7 12h10M7 17h7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Tracking por estados",
    description: "Timeline de eventos, sem depender de GPS continuo no fluxo principal.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M12 22s7-4.4 7-12a7 7 0 1 0-14 0c0 7.6 7 12 7 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Financeiro rastreavel",
    description: "Pagamento por chamado + webhook, com regra matematica: FP = RE + CP.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M4 12h10M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const howItWorks = [
  { title: "1) Criar chamado", description: "Cliente, destino e urgencia. Cotacao com preco e ETA." },
  { title: "2) Confirmar pagamento", description: "Checkout gerado. Webhook confirma e libera o dispatch." },
  { title: "3) Execucao por estados", description: "Rider opera com estados claros, sem ruido e sem salto invalido." },
  { title: "4) Fechamento e auditoria", description: "Historico, tracking e financeiro com trilha auditavel." },
];

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-background roodi-noise">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div className="absolute inset-0 roodi-grid" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-primary-soft blur-3xl animate-roodi-float"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-surface-3 blur-3xl animate-roodi-float"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  Uma guilda que funciona: regras claras, log de tudo.
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                  Em breve: Roodi tambem tera delivery
                </div>
              </div>

              <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-6xl">
                Entregas sob demanda com{" "}
                <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  confianca operacional
                </span>
                .
              </h1>

              <p className="max-w-xl text-base text-muted md:text-lg">
                O comercio cria o chamado, paga por entrega e acompanha uma timeline de eventos. O rider opera por
                estados claros e ve valor antes do aceite. O admin governa precos e audita logs, sem algoritmo secreto.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/para-comerciantes"
                  className="roodi-focus-ring inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
                >
                  Sou comerciante
                </Link>
                <Link
                  href="/para-entregadores"
                  className="roodi-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors duration-fast hover:bg-surface-2"
                >
                  Sou entregador
                </Link>
                <Link
                  href="/como-funciona"
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-muted transition-colors duration-fast hover:border-border hover:bg-surface-1 hover:text-foreground"
                >
                  Ver como funciona
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Sem GPS continuo</span>
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Rodizio por zona</span>
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Pagamento por chamado</span>
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Logs auditaveis</span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="roodi-panel grid gap-4 rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Roodi</p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-foreground">Operacao por estados</p>
                    <p className="mt-1 text-sm text-muted">
                      Timeline de eventos: cada etapa tem dono, momento e efeito operacional.
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                      <path
                        d="M12 22s7-4.4 7-12a7 7 0 1 0-14 0c0 7.6 7 12 7 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "Chamado criado", active: true },
                    { label: "Pagamento confirmado", active: true },
                    { label: "Rider a caminho", active: true },
                    { label: "Entrega concluida", active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span
                        className={["h-2.5 w-2.5 rounded-full", item.active ? "bg-success" : "bg-border"].join(" ")}
                        aria-hidden="true"
                      />
                      <p className="text-sm text-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="roodi-panel grid gap-4 rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold tracking-tight text-foreground">Justica na alocacao</p>
                    <p className="mt-1 text-sm text-muted">
                      Oferta em lotes (Top 3/5) com janela curta. Sem dedo rapido, sem panelinha.
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                      <path
                        d="M4 12h16M7 7h10M7 17h10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Zona", value: "Fila justa" },
                    { label: "Janela", value: "12-15s" },
                    { label: "Desempate", value: "Posicao" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-surface-2 p-3">
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="roodi-panel grid gap-3 rounded-3xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Regra financeira</p>
                <p className="text-lg font-bold tracking-tight text-foreground">FP = RE + CP</p>
                <p className="text-sm text-muted">
                  O comercio paga o frete da plataforma (FP). O rider recebe o repasse (RE). A plataforma retém a comissao (CP).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {trustPillars.map((item) => (
              <div key={item.title} className="roodi-panel rounded-3xl p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    {item.icon}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Por que Roodi</p>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Menos atrito na operacao. Mais previsibilidade para todos.
            </h2>
            <p className="max-w-xl text-base text-muted">
              O objetivo e eliminar duvida e discussao: fila e regras visiveis, tracking por estados e auditoria de ponta a ponta.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Sem algoritmo secreto",
                description: "Regras publicas, operacao rastreavel e decisao explicavel.",
              },
              {
                title: "Privacidade por design",
                description: "Nao depende de GPS continuo no fluxo principal. O tracking e por eventos.",
              },
              {
                title: "Justica na oferta",
                description: "Rodizio + aptidao. Recusa e direito, abuso tem custo numerico.",
              },
              {
                title: "Governanca real",
                description: "Preco e admin_only. Logs e auditoria sustentam suporte e disputa.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="roodi-panel rounded-3xl p-6 transition-transform duration-fast hover:-translate-y-0.5"
              >
                <h3 className="text-base font-bold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Como funciona</p>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Um fluxo unico do chamado ao comprovante.
            </h2>
            <p className="max-w-3xl text-base text-muted">
              Do lado do comerciante, a prioridade e velocidade e previsibilidade. Do lado do rider, clareza de estado e
              execucao sem ruído.
            </p>
          </header>

          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {howItWorks.map((step) => (
              <li key={step.title} className="roodi-panel rounded-3xl p-6">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/como-funciona"
              className="roodi-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
            >
              Ver detalhes do fluxo
            </Link>
            <Link
              href="/contato"
              className="roodi-focus-ring inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
            >
              Quero conversar
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Para quem</p>
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Dois perfis. Um app. Uma operacao.
          </h2>
          <p className="max-w-3xl text-base text-muted">
            O app mobile e unico, com contexto de uso para comercio e rider. O painel web organiza governanca e
            auditoria.
          </p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/para-comerciantes"
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface-1 p-6 shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-transparent to-transparent opacity-0 transition-opacity duration-fast group-hover:opacity-60" />
            <div className="relative space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Comercio</p>
              <p className="text-xl font-black tracking-tight text-foreground">Chame um rider quando precisar.</p>
              <p className="text-sm text-muted">
                Abra chamado em segundos, acompanhe timeline e mantenha clientes e produtos organizados.
              </p>
              <p className="pt-2 text-sm font-semibold text-primary">Ver beneficios</p>
            </div>
          </Link>

          <Link
            href="/para-entregadores"
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface-1 p-6 shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-transparent to-transparent opacity-0 transition-opacity duration-fast group-hover:opacity-60" />
            <div className="relative space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rider</p>
              <p className="text-xl font-black tracking-tight text-foreground">Execute corridas com clareza.</p>
              <p className="text-sm text-muted">
                Receba ofertas, aceite, siga estados operacionais e finalize com confirmacao.
              </p>
              <p className="pt-2 text-sm font-semibold text-primary">Ver beneficios</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="roodi-panel grid gap-6 rounded-[28px] p-8 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Em breve</p>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Roodi tambem tera delivery.
              </h2>
              <p className="text-base text-muted">
                Alem do chamado do comercio, estamos preparando uma experiencia completa de delivery para o cliente final
                (pedido, pagamento e acompanhamento).
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "Cardapio e vitrine do comercio",
                "Pagamento no checkout e confirmacao automatica",
                "Acompanhamento por estados e comprovante",
              ].map((line) => (
                <div key={line} className="roodi-panel flex items-start gap-3 rounded-2xl p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-sm text-muted">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="roodi-panel mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">Quer participar do piloto?</p>
              <p className="text-sm text-muted">Deixe um contato e o time chama voce.</p>
            </div>
            <Link
              href="/contato"
              className="roodi-focus-ring inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
            >
              Entrar em contato
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
