import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCreditsAdjustment,
  loadAdminCreditsLedger,
} from "@modules/credits/application/admin-credits.service";
import { AdminCreditsLedgerTable } from "@modules/credits/presentation/admin-credits-ledger-table";

type AdminCreditsPageProps = {
  searchParams?: {
    page?: string;
    state?: string;
  };
};

async function createAdjustmentAction(formData: FormData): Promise<void> {
  "use server";

  const commerceId = String(formData.get("commerce_id") ?? "").trim();
  const amountBrl = Number(formData.get("amount_brl") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const result = await createCreditsAdjustment({
    commerce_id: commerceId,
    amount_brl: amountBrl,
    reason,
  });

  if (result.error) {
    redirect("/admin/credits?state=error");
  }

  revalidatePath("/admin/credits");
  redirect("/admin/credits?state=success");
}

export default async function AdminCreditsPage({
  searchParams,
}: AdminCreditsPageProps): Promise<JSX.Element> {
  const pageValue = Number(searchParams?.page ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const state = searchParams?.state;

  const result = await loadAdminCreditsLedger({
    page,
    limit: 30,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Creditos</h1>
        <p className="text-sm text-muted">
          Extrato global de creditos e ajuste manual para contas de comercio.
        </p>
      </header>

      {state === "success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Ajuste de credito realizado com sucesso.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao aplicar ajuste de credito.
        </p>
      ) : null}

      <form
        action={createAdjustmentAction}
        className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-4"
      >
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Commerce ID
          </span>
          <input
            name="commerce_id"
            placeholder="UUID do comercio"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Valor (BRL)
          </span>
          <input
            name="amount_brl"
            type="number"
            step="0.01"
            placeholder="10.00 ou -10.00"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Motivo
          </span>
          <input
            name="reason"
            placeholder="Ajuste administrativo"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            required
          />
        </label>
        <div className="sm:col-span-4">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Aplicar ajuste
          </button>
        </div>
      </form>

      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data && result.data.data.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Nenhum lancamento encontrado.
        </p>
      ) : null}

      {result.data && result.data.data.length > 0 ? (
        <AdminCreditsLedgerTable entries={result.data.data} />
      ) : null}
    </section>
  );
}
