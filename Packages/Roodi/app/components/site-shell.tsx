import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type SiteShellProps = Readonly<{
  children: React.ReactNode;
}>;

const navItems = [
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/para-comerciantes", label: "Para comerciantes" },
  { href: "/para-entregadores", label: "Para entregadores" },
  { href: "/contato", label: "Contato" },
];

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border roodi-glass backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm transition-transform duration-fast group-hover:-translate-y-0.5">
              <span className="absolute inset-0 bg-gradient-to-br from-primary to-success opacity-60" aria-hidden="true" />
              <span className="relative">R</span>
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Roodi</p>
              <p className="text-xs text-muted">Entregas sob demanda para comercio local</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="roodi-focus-ring rounded-md border border-transparent px-3 py-2 transition-colors duration-fast hover:border-border hover:bg-surface-2 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/contato"
              className="roodi-focus-ring hidden rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2 sm:inline-flex"
            >
              Falar com o time
            </Link>

            <details className="relative md:hidden">
              <summary className="roodi-focus-ring cursor-pointer select-none rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2">
                Menu
              </summary>
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-md">
                <div className="grid">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="roodi-focus-ring px-4 py-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="w-full">{children}</main>

      <footer className="border-t border-border bg-surface-1">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Roodi</p>
            <p className="text-sm text-muted">
              Plataforma de entregas sob demanda para comercio local, com operacao orientada por estados e auditabilidade.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Navegacao</p>
            <Link href="/como-funciona" className="hover:text-foreground">
              Como funciona
            </Link>
            <Link href="/para-comerciantes" className="hover:text-foreground">
              Para comerciantes
            </Link>
            <Link href="/para-entregadores" className="hover:text-foreground">
              Para entregadores
            </Link>
            <Link href="/contato" className="hover:text-foreground">
              Contato
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-muted">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Legal</p>
            <Link href="/termos" className="hover:text-foreground">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <p className="pt-2 text-xs text-muted">© {new Date().getFullYear()} Roodi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
