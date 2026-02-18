export const metadata = {
  title: "Cookies",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Politica de cookies
          </h1>
          <p className="max-w-3xl text-sm text-muted">
            Definicoes iniciais para analytics e funcionamento basico da landing.
          </p>
        </header>

        <article className="rounded-2xl border border-border bg-surface-1 p-6 text-sm text-foreground shadow-sm">
          <p>Cookies essenciais podem ser utilizados para experiencia de navegacao e medicoes agregadas de uso.</p>
        </article>
      </section>
    </div>
  );
}
