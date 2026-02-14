import Link from "next/link";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-1">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-sm font-bold text-primary">
              R
            </span>
            <span className="text-sm font-semibold text-foreground">Roodi Admin</span>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/admin/dashboard" className="rounded-md px-2 py-1 hover:bg-surface-2">
              Dashboard
            </Link>
            <Link href="/admin/login" className="rounded-md px-2 py-1 hover:bg-surface-2">
              Sair
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
