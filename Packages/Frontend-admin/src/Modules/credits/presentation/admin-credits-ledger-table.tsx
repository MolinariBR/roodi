import type { CreditsLedgerListResponse } from "@core/api-client/admin-api.server";
import { formatCurrencyBRL, formatDateTime } from "@core/shared/format";

type AdminCreditsLedgerTableProps = {
  entries: CreditsLedgerListResponse["data"];
};

export function AdminCreditsLedgerTable({ entries }: AdminCreditsLedgerTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2">
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Valor</th>
            <th className="px-3 py-2">Saldo apos</th>
            <th className="px-3 py-2">Referencia</th>
            <th className="px-3 py-2">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t border-border">
              <td className="px-3 py-2 capitalize text-foreground">{entry.type}</td>
              <td className="px-3 py-2 font-semibold text-foreground">
                {formatCurrencyBRL(entry.amount_brl)}
              </td>
              <td className="px-3 py-2 text-foreground">
                {formatCurrencyBRL(entry.balance_after_brl)}
              </td>
              <td className="px-3 py-2 text-muted">{entry.reference ?? "-"}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(entry.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
