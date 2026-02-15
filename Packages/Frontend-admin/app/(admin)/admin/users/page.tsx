import { type UserRole, type UserStatus } from "@core/api-client/admin-api.server";
import { listAdminUsers } from "@modules/users/application/admin-users.service";
import { AdminUsersTable } from "@modules/users/presentation/admin-users-table";

type AdminUsersPageProps = {
  searchParams?: {
    role?: string;
    status?: string;
    page?: string;
  };
};

const roleOptions: Array<{ value: "" | UserRole; label: string }> = [
  { value: "", label: "Todas as roles" },
  { value: "admin", label: "Admin" },
  { value: "commerce", label: "Comercio" },
  { value: "rider", label: "Rider" },
];

const statusOptions: Array<{ value: "" | UserStatus; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: "active", label: "Ativo" },
  { value: "suspended", label: "Suspenso" },
  { value: "blocked", label: "Bloqueado" },
];

const parseRole = (value: string | undefined): UserRole | undefined => {
  if (value === "admin" || value === "commerce" || value === "rider") {
    return value;
  }

  return undefined;
};

const parseStatus = (value: string | undefined): UserStatus | undefined => {
  if (value === "active" || value === "suspended" || value === "blocked") {
    return value;
  }

  return undefined;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps): Promise<JSX.Element> {
  const pageValue = Number(searchParams?.page ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const role = parseRole(searchParams?.role);
  const status = parseStatus(searchParams?.status);

  const result = await listAdminUsers({
    page,
    limit: 100,
    role,
    status,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="text-sm text-muted">Filtro por role e status para auditoria administrativa.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Role</span>
          <select
            name="role"
            defaultValue={role ?? ""}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {roleOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {!result.error && result.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum usuario encontrado para os filtros informados.
        </p>
      ) : null}

      {result.data.length > 0 ? <AdminUsersTable users={result.data} /> : null}
    </section>
  );
}
