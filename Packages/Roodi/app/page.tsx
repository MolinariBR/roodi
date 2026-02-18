import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-surface-1">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-primary-soft blur-3xl animate-roodi-float"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-surface-3 blur-3xl animate-roodi-float"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Em breve: Roodi tambem tera delivery
              </div>

              <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-6xl">
                Entregas sob demanda para comercio local, com operacao simples e previsivel.
              </h1>

              <p className="max-w-xl text-base text-muted md:text-lg">
                O comerciante cria o chamado, paga por entrega e acompanha o tracking por estados. O rider executa o
                fluxo operacional com clareza. O admin audita, ajusta regras e governa a plataforma.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/para-comerciantes"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
                >
                  Sou comerciante
                </Link>
                <Link
                  href="/para-entregadores"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors duration-fast hover:bg-surface-2"
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
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Cotacao por bairros</span>
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Tracking por estados</span>
                <span className="rounded-full border border-border bg-surface-1 px-3 py-1">Pagamento por chamado</span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Roodi</p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-foreground">Operacao por estado</p>
                    <p className="mt-1 text-sm text-muted">
                      Sem depender de GPS continuo no fluxo principal. O tracking e uma timeline clara de eventos.
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
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          item.active ? "bg-success" : "bg-border",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <p className="text-sm text-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold tracking-tight text-foreground">Cotacao previsivel</p>
                    <p className="mt-1 text-sm text-muted">
                      Matriz de bairros + fallback deterministico para distancia/tempo e politica clara de precificacao.
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                      <path
                        d="M5 12h14M5 7h14M5 17h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Preco", value: "R$ 12,90" },
                    { label: "ETA", value: "18 min" },
                    { label: "Zona", value: "3" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-surface-2 p-3">
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Por que Roodi</p>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Menos friccao na operacao. Mais controle no financeiro.
            </h2>
            <p className="max-w-xl text-base text-muted">
              Roodi foi desenhado para reduzir estados ambíguos: o que esta acontecendo agora, o que vem depois e o que
              pode dar errado.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Tracking por estados",
                description: "Timeline operacional. Cada evento tem dono, momento e efeito auditavel.",
              },
              {
                title: "Cotacao deterministica",
                description: "Matriz local de bairros + provedores de fallback quando necessario.",
              },
              {
                title: "Pagamento por chamado",
                description: "Geracao de checkout e conciliacao por webhook, com idempotencia e retry.",
              },
              {
                title: "Governanca no admin",
                description: "Regras de preco admin_only, auditoria e operacao centralizada.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
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
            {[
              {
                title: "1) Criar chamado",
                description: "Cliente, destino e urgencia. Cotacao com preco e ETA.",
              },
              {
                title: "2) Confirmar pagamento",
                description: "Checkout gerado. Webhook confirma e libera o dispatch.",
              },
              {
                title: "3) Execucao por estados",
                description: "Rider segue o fluxo operacional ate a entrega.",
              },
              {
                title: "4) Fechamento e auditoria",
                description: "Financeiro registra e o admin consegue auditar a trilha.",
              },
            ].map((step) => (
              <li key={step.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/como-funciona"
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
            >
              Ver detalhes do fluxo
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
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
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/60 via-transparent to-transparent opacity-0 transition-opacity duration-fast group-hover:opacity-100" />
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
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 shadow-sm transition-transform duration-fast hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/60 via-transparent to-transparent opacity-0 transition-opacity duration-fast group-hover:opacity-100" />
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
          <div className="grid gap-6 rounded-3xl border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:items-center">
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
                <div key={line} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-1 p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-sm text-muted">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-1 p-6">
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">Quer participar do piloto?</p>
              <p className="text-sm text-muted">Deixe um contato e o time chama voce.</p>
            </div>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
            >
              Entrar em contato
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
