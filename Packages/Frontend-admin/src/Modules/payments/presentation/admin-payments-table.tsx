import Link from "next/link";
import type {
  AdminPaymentTransaction,
  PaymentStatus,
} from "@core/api-client/admin-api.server";
import { formatCurrencyBRL, formatDateTime } from "@core/shared/format";

type AdminPaymentsTableProps = {
  items: AdminPaymentTransaction[];
};

const statusClassName: Record<PaymentStatus, string> = {
  pending: "bg-surface-2 text-warning",
  approved: "bg-primary-soft text-success",
  failed: "bg-surface-2 text-danger",
  canceled: "bg-surface-2 text-muted",
};

export function AdminPaymentsTable({ items }: AdminPaymentsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2">
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2">Transacao</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Valor</th>
            <th className="px-3 py-2">Pago</th>
            <th className="px-3 py-2">Metodo</th>
            <th className="px-3 py-2">Criado em</th>
            <th className="px-3 py-2">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-xs text-muted">{item.id}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClassName[item.status]}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-3 py-2 font-semibold text-foreground">
                {formatCurrencyBRL(item.amount_brl)}
              </td>
              <td className="px-3 py-2 text-foreground">
                {formatCurrencyBRL(item.paid_amount_brl ?? 0)}
              </td>
              <td className="px-3 py-2 text-muted">{item.capture_method ?? "-"}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(item.created_at)}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/payments?transactionId=${item.id}`}
                  className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-surface-2"
                >
                  Detalhe
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
