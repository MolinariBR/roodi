import type { AdminUser, UserRole, UserStatus } from "@core/api-client/admin-api.server";

type AdminUsersTableProps = {
  users: AdminUser[];
};

const roleLabel: Record<UserRole, string> = {
  admin: "Admin",
  commerce: "Comercio",
  rider: "Rider",
};

const statusLabel: Record<UserStatus, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  blocked: "Bloqueado",
};

const statusClassName: Record<UserStatus, string> = {
  active: "bg-primary-soft text-primary",
  suspended: "bg-surface-2 text-warning",
  blocked: "bg-surface-2 text-danger",
};

const truncateId = (value: string): string => {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

export function AdminUsersTable({ users }: AdminUsersTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2">
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border">
              <td className="px-3 py-2 font-medium text-foreground">{user.name}</td>
              <td className="px-3 py-2 text-muted">{user.email}</td>
              <td className="px-3 py-2 text-foreground">{roleLabel[user.role]}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClassName[user.status]}`}
                >
                  {statusLabel[user.status]}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-muted">{truncateId(user.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
