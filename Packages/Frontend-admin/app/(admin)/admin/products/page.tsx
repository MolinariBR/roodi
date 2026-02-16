export default function AdminProductsPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
        <p className="text-sm text-muted">
          Visao administrativa do catalogo de produtos cadastrados pelos comercios.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Status do modulo</h2>
        <p className="mt-2 text-sm text-muted">
          A rota administrativa de produtos ja esta disponivel no painel. A listagem consolidada de
          catalogo por comercio sera conectada ao endpoint admin correspondente na proxima etapa.
        </p>
      </div>
    </section>
  );
}
