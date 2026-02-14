import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-primary">Landing institucional</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Roodi conecta comercio e rider em fluxo unico</h2>
        <p className="max-w-3xl text-base text-muted">
          O comerciante abre chamado, o rider executa por estados operacionais e toda a operação fica auditável para gestão.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
          <h3 className="text-lg font-semibold">Previsibilidade</h3>
          <p className="mt-2 text-sm text-muted">Cotacao baseada em matriz de bairros e regras de negocio administradas no painel.</p>
        </article>
        <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
          <h3 className="text-lg font-semibold">Operacao simples</h3>
          <p className="mt-2 text-sm text-muted">Sem excesso de telas no app: estados claros e ações objetivas.</p>
        </article>
        <article className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
          <h3 className="text-lg font-semibold">Controle financeiro</h3>
          <p className="mt-2 text-sm text-muted">Fluxo de creditos, cobranca e conciliacao com trilha auditavel.</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/como-funciona" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Como funciona
        </Link>
        <Link href="/contato" className="rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold">
          Falar com o time
        </Link>
      </div>
    </section>
  );
}
