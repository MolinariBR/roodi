import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loadSystemFlags,
  loadSystemMaintenance,
  saveSystemFlag,
  saveSystemMaintenance,
} from "@modules/system/application/admin-system.service";
import { SystemFlagList } from "@modules/system/presentation/system-flag-list";
import { formatDateTime } from "@core/shared/format";

type AdminSystemPageProps = {
  searchParams?: {
    state?: string;
  };
};

async function updateFlagAction(formData: FormData): Promise<void> {
  "use server";

  const flagKey = String(formData.get("flag_key") ?? "").trim();
  const enabledValue = String(formData.get("enabled") ?? "false");

  const result = await saveSystemFlag({
    flagKey,
    enabled: enabledValue === "true",
  });

  if (result.error) {
    redirect("/admin/system?state=flag_error");
  }

  revalidatePath("/admin/system");
  redirect("/admin/system?state=flag_success");
}

async function updateMaintenanceAction(formData: FormData): Promise<void> {
  "use server";

  const enabledValue = String(formData.get("enabled") ?? "false");
  const message = String(formData.get("message") ?? "");
  const expectedBackAt = String(formData.get("expected_back_at") ?? "").trim();

  const result = await saveSystemMaintenance({
    enabled: enabledValue === "true",
    message,
    ...(expectedBackAt ? { expected_back_at: expectedBackAt } : {}),
  });

  if (result.error) {
    redirect("/admin/system?state=maintenance_error");
  }

  revalidatePath("/admin/system");
  redirect("/admin/system?state=maintenance_success");
}

export default async function AdminSystemPage({
  searchParams,
}: AdminSystemPageProps): Promise<JSX.Element> {
  const state = searchParams?.state;
  const [flagsResult, maintenanceResult] = await Promise.all([
    loadSystemFlags(),
    loadSystemMaintenance(),
  ]);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Sistema</h1>
        <p className="text-sm text-muted">Controle de flags e modo de manutenção global.</p>
      </header>

      {state === "flag_success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Flag atualizada com sucesso.
        </p>
      ) : null}
      {state === "flag_error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao atualizar flag.
        </p>
      ) : null}
      {state === "maintenance_success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Modo de manutenção atualizado com sucesso.
        </p>
      ) : null}
      {state === "maintenance_error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao atualizar manutenção.
        </p>
      ) : null}

      {flagsResult.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {flagsResult.error}
        </p>
      ) : null}
      {maintenanceResult.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {maintenanceResult.error}
        </p>
      ) : null}

      {flagsResult.data ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">System flags</h2>
          <SystemFlagList flags={flagsResult.data.data} />
          <div className="grid gap-3">
            {flagsResult.data.data.map((flag) => (
              <form
                key={flag.key}
                action={updateFlagAction}
                className="grid gap-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm sm:grid-cols-[1fr_auto]"
              >
                <input type="hidden" name="flag_key" value={flag.key} />
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {flag.key}
                  </span>
                  <select
                    name="enabled"
                    defaultValue={flag.enabled ? "true" : "false"}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Atualizar flag
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {maintenanceResult.data ? (
        <section className="space-y-3 rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Modo manutenção</h2>
          <p className="text-xs text-muted">
            Última atualização: {formatDateTime(maintenanceResult.data.updated_at)}
          </p>
          <form action={updateMaintenanceAction} className="grid gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Estado</span>
              <select
                name="enabled"
                defaultValue={maintenanceResult.data.enabled ? "true" : "false"}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              >
                <option value="false">Desativado</option>
                <option value="true">Ativado</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Mensagem
              </span>
              <input
                name="message"
                defaultValue={maintenanceResult.data.message}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Previsão de retorno
              </span>
              <input
                type="datetime-local"
                name="expected_back_at"
                defaultValue={
                  maintenanceResult.data.expected_back_at
                    ? maintenanceResult.data.expected_back_at.slice(0, 16)
                    : ""
                }
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Salvar manutenção
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
}
