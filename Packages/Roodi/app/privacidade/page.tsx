export const metadata = {
  title: "Privacidade",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">Privacidade</h1>
          <p className="max-w-3xl text-sm text-muted">
            Compromisso com minimizacao de dados e uso estritamente operacional.
          </p>
        </header>

        <article className="rounded-2xl border border-border bg-surface-1 p-6 text-sm text-foreground shadow-sm">
          <p>
            Dados coletados sao utilizados para autenticacao, operacao de entrega, suporte e conformidade regulatoria.
          </p>
        </article>
      </section>
    </div>
  );
}
