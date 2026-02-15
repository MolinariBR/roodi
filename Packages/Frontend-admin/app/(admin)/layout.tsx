import { UserButton } from "@clerk/nextjs";
import { AdminSidebar } from "@core/app-shell/admin-sidebar";
import { requireAdminSession } from "@core/auth/admin-access.server";
import { ThemeModeToggle } from "@core/design-system";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const adminSession = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
              R
            </span>
            <div>
              <p className="text-sm font-semibold">Roodi Admin</p>
              <p className="text-xs text-muted">Painel de gestao</p>
            </div>
          </div>
          <AdminSidebar />
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-col rounded-xl border border-border bg-surface-1 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{adminSession.displayName}</p>
              <p className="text-xs text-muted">{adminSession.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeModeToggle />
              <UserButton afterSignOutUrl="/admin/login" />
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
