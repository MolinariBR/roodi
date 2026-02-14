export default function AdminLoginPage() {
  return (
    <section className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Email</span>
        <input
          type="email"
          placeholder="admin@roodi.app"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast ease-[var(--ease-standard)] focus:border-primary"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Senha</span>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast ease-[var(--ease-standard)] focus:border-primary"
        />
      </label>

      <button
        type="button"
        className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity duration-fast ease-[var(--ease-standard)] hover:opacity-90"
      >
        Entrar
      </button>
    </section>
  );
}
