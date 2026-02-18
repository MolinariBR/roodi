export const metadata = {
  title: "Termos de uso",
};

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">Termos de uso</h1>
          <p className="max-w-3xl text-sm text-muted">
            Versao inicial para ambiente de desenvolvimento e homologacao.
          </p>
        </header>

        <article className="rounded-2xl border border-border bg-surface-1 p-6 text-sm text-foreground shadow-sm">
          <p>
            Ao utilizar a plataforma, o usuario concorda com as regras operacionais e financeiras vigentes no Roodi.
          </p>
        </article>
      </section>
    </div>
  );
}
