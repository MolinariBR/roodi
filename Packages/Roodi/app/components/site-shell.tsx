import Link from "next/link";

type SiteShellProps = Readonly<{
  children: React.ReactNode;
}>;

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/contato", label: "Contato" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Roodi</p>
            <h1 className="text-lg font-bold">Entrega inteligente para comercio local</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-transparent px-2 py-1 transition-colors duration-fast hover:border-border hover:bg-surface-2 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-border bg-surface-1">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted">
          <span>© {new Date().getFullYear()} Roodi</span>
          <span>Plataforma de entregas para comercio e riders.</span>
        </div>
      </footer>
    </div>
  );
}
