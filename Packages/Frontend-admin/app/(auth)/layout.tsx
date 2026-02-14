type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6 shadow-sm">
        <header className="mb-6 space-y-2 text-center">
          <p className="text-sm font-semibold text-primary">ROODI ADMIN</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Acesso ao painel</h1>
          <p className="text-sm text-muted">Use suas credenciais administrativas para continuar.</p>
        </header>
        {children}
      </div>
    </main>
  );
}
