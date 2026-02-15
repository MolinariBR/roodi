import type { PaymentStatus } from "@core/api-client/admin-api.server";
import {
  loadAdminPaymentTransaction,
  loadAdminPaymentTransactions,
} from "@modules/payments/application/admin-payments.service";
import { AdminPaymentDetail } from "@modules/payments/presentation/admin-payment-detail";
import { AdminPaymentsTable } from "@modules/payments/presentation/admin-payments-table";

type AdminPaymentsPageProps = {
  searchParams?: {
    status?: string;
    page?: string;
    transactionId?: string;
  };
};

const parseStatus = (value: string | undefined): PaymentStatus | undefined => {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "failed" ||
    value === "canceled"
  ) {
    return value;
  }

  return undefined;
};

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps): Promise<JSX.Element> {
  const pageValue = Number(searchParams?.page ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const status = parseStatus(searchParams?.status);
  const transactionId = searchParams?.transactionId?.trim();

  const [listResult, detailResult] = await Promise.all([
    loadAdminPaymentTransactions({
      page,
      limit: 20,
      status,
    }),
    transactionId ? loadAdminPaymentTransaction(transactionId) : Promise.resolve({ data: null, error: null }),
  ]);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
        <p className="text-sm text-muted">
          Lista, detalhe e status operacional de transacoes/webhooks.
        </p>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-[1fr_auto]">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            <option value="">Todos os status</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="failed">failed</option>
            <option value="canceled">canceled</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Filtrar
          </button>
        </div>
      </form>

      {listResult.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {listResult.error}
        </p>
      ) : null}

      {listResult.data && listResult.data.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhuma transacao encontrada.
        </p>
      ) : null}

      {listResult.data && listResult.data.data.length > 0 ? (
        <AdminPaymentsTable items={listResult.data.data} />
      ) : null}

      {detailResult.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {detailResult.error}
        </p>
      ) : null}

      {detailResult.data ? <AdminPaymentDetail transaction={detailResult.data} /> : null}
    </section>
  );
}
