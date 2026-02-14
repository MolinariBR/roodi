export default function ContatoPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contato</h2>
        <p className="max-w-3xl text-base text-muted">Deixe seus dados para o time comercial retornar.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 md:max-w-2xl">
        <label className="grid gap-2 text-sm font-medium">
          Nome
          <input className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Seu nome" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            type="email"
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="voce@empresa.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Mensagem
          <textarea
            rows={4}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Conte brevemente seu cenário"
          />
        </label>
        <button type="button" className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Enviar
        </button>
      </form>
    </section>
  );
}
