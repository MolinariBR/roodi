import Link from "next/link";

export const metadata = {
  title: "Para comerciantes",
  description: "Chame riders sob demanda com cotacao previsivel, tracking por estados e pagamento por chamado.",
};

export default function ParaComerciantesPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-surface-1">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <p className="inline-flex w-fit items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted shadow-sm">
                Para comerciantes
              </p>
              <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">
                Entrega sob demanda com controle do inicio ao fim.
              </h1>
              <p className="max-w-xl text-base text-muted md:text-lg">
                Abra um chamado em segundos, pague por entrega e acompanhe a timeline operacional. Roodi evita estados
                ambíguos e reduz friccao na operacao do dia a dia.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contato?type=commerce"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
                >
                  Quero usar no meu negocio
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
                  title: "Cotacao previsivel",
                  description:
                    "Preco e ETA com matriz de bairros + fallback deterministico para distancia/tempo.",
                },
                {
                  title: "Tracking por estados",
                  description:
                    "Timeline operacional (sem depender de GPS continuo no fluxo principal).",
                },
                {
                  title: "Cadastros reaproveitaveis",
                  description:
                    "Clientes e produtos organizados para acelerar novos chamados e reduzir erros.",
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
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">O que voce ganha</p>
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">Menos friccao, mais previsibilidade.</h2>
          <p className="max-w-3xl text-base text-muted">
            Roodi e pensado para operacao: cada etapa tem um estado claro e efeitos auditaveis (pagamento, despache,
            confirmacao).
          </p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Operacao enxuta",
              description: "Um app unico para comercio + rider, com navegacao objetiva e poucas telas.",
            },
            {
              title: "Financeiro rastreavel",
              description: "Checkout, webhook, conciliacao e trilha de auditoria no painel admin.",
            },
            {
              title: "Governanca de preco",
              description: "Regras admin_only para zona, urgencia e acrescimos (peak, clima, etc).",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
              <h3 className="text-base font-bold tracking-tight text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="grid gap-6 rounded-3xl border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:items-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pronto para testar?</p>
              <p className="text-2xl font-black tracking-tight text-foreground">Fale com o time e entre no piloto.</p>
              <p className="text-sm text-muted">
                Conte rapidamente seu cenario (cidade, volume de entregas e tipo de operacao) e retornamos com os
                proximos passos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/contato?type=commerce"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90"
              >
                Entrar em contato
              </Link>
              <Link
                href="/para-entregadores"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
              >
                Ver para entregadores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

