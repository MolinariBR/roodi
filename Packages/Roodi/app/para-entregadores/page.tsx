import Link from "next/link";

export const metadata = {
  title: "Para entregadores",
  description: "Rider executa corridas com estados claros, ofertas objetivas e fechamento com confirmacao.",
};

export default function ParaEntregadoresPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-surface-1">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <p className="inline-flex w-fit items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted shadow-sm">
                Para entregadores (Rider)
              </p>
              <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">
                Corridas com clareza de estado do comeco ao fim.
              </h1>
              <p className="max-w-xl text-base text-muted md:text-lg">
                Receba ofertas, aceite ou recuse, execute a entrega por estados e finalize com confirmacao. Menos ruido,
                mais objetividade na operacao.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contato?type=rider"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
                >
                  Quero ser rider
                </Link>
                <Link
                  href="/como-funciona"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
                >
                  Entender o fluxo
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Ofertas objetivas",
                  description: "Aceitar ou recusar com contexto do chamado e prioridade clara.",
                },
                {
                  title: "Timeline operacional",
                  description: "A entrega avanca por estados: a caminho, chegou, aguardando, entregue, etc.",
                },
                {
                  title: "Fechamento com confirmacao",
                  description: "Codigo de confirmacao e evento de conclusao registrados para auditoria.",
                },
              ].map((card) => (
                <article key={card.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="text-base font-bold tracking-tight text-foreground">{card.title}</h2>
                  <p className="mt-2 text-sm text-muted">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Como e a operacao</p>
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">Estado atual sempre visivel.</h2>
          <p className="max-w-3xl text-base text-muted">
            O card principal muda por estado, sem espalhar a operacao em multiplas telas. Isso reduz erro e acelera a
            execucao.
          </p>
        </header>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1) Oferta",
              description: "Voce recebe uma oferta e decide aceitar ou recusar.",
            },
            {
              title: "2) Execucao",
              description: "Etapas operacionais registradas em eventos (chegou, aguardando, a caminho, etc).",
            },
            {
              title: "3) Conclusao",
              description: "Codigo de confirmacao e finalizacao. O historico fica disponivel no app.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="grid gap-6 rounded-3xl border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:items-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pronto para entrar?</p>
              <p className="text-2xl font-black tracking-tight text-foreground">Deixe um contato.</p>
              <p className="text-sm text-muted">Entramos em contato para liberar acesso e orientar os proximos passos.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/contato?type=rider"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
              >
                Entrar em contato
              </Link>
              <Link
                href="/para-comerciantes"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
              >
                Ver para comerciantes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

