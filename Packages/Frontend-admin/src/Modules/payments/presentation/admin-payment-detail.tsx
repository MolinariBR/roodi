import type { AdminPaymentTransaction } from "@core/api-client/admin-api.server";
import { formatCurrencyBRL, formatDateTime } from "@core/shared/format";

type AdminPaymentDetailProps = {
  transaction: AdminPaymentTransaction;
};

type FieldProps = {
  label: string;
  value: string;
};

function Field({ label, value }: FieldProps): JSX.Element {
  return (
    <div className="rounded-md bg-surface-2 p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function AdminPaymentDetail({ transaction }: AdminPaymentDetailProps): JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Detalhe da transacao</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="ID" value={transaction.id} />
        <Field label="Status" value={transaction.status} />
        <Field label="Provider" value={transaction.provider} />
        <Field label="Metodo" value={transaction.capture_method ?? "-"} />
        <Field label="Valor" value={formatCurrencyBRL(transaction.amount_brl)} />
        <Field
          label="Valor pago"
          value={formatCurrencyBRL(transaction.paid_amount_brl ?? 0)}
        />
        <Field label="Order NSU" value={transaction.order_nsu ?? "-"} />
        <Field label="Transaction NSU" value={transaction.transaction_nsu ?? "-"} />
        <Field label="Webhook status" value={transaction.status} />
        <Field label="Criado em" value={formatDateTime(transaction.created_at)} />
      </div>
    </section>
  );
}
