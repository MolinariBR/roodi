import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PricingRules } from "@core/api-client/admin-api.server";
import {
  loadPricingRules,
  savePricingRules,
} from "@modules/pricing/application/admin-pricing.service";
import { PricingRulesSummary } from "@modules/pricing/presentation/pricing-rules-summary";

type AdminPricingPageProps = {
  searchParams?: {
    state?: string;
  };
};

const parseNumber = (value: FormDataEntryValue | null): number => {
  const parsed = Number(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDistanceZones = (value: FormDataEntryValue | null): PricingRules["distance_zones_brl"] => {
  const fallback: PricingRules["distance_zones_brl"] = [];
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const zone = Number((item as { zone?: unknown }).zone);
        const minKm = Number((item as { min_km?: unknown }).min_km);
        const maxKm = Number((item as { max_km?: unknown }).max_km);
        const valueBrl = Number((item as { value_brl?: unknown }).value_brl);

        if (
          !Number.isFinite(zone) ||
          !Number.isFinite(minKm) ||
          !Number.isFinite(maxKm) ||
          !Number.isFinite(valueBrl)
        ) {
          return null;
        }

        return {
          zone,
          min_km: minKm,
          max_km: maxKm,
          value_brl: valueBrl,
        };
      })
      .filter((item): item is PricingRules["distance_zones_brl"][number] => item !== null);
  } catch {
    return fallback;
  }
};

async function updatePricingRulesAction(formData: FormData): Promise<void> {
  "use server";

  const payload: PricingRules = {
    urgency_addon_brl: {
      padrao: parseNumber(formData.get("urgency_padrao")),
      urgente: parseNumber(formData.get("urgency_urgente")),
      agendado: parseNumber(formData.get("urgency_agendado")),
    },
    conditional_addons_brl: {
      sunday: parseNumber(formData.get("conditional_sunday")),
      holiday: parseNumber(formData.get("conditional_holiday")),
      rain: parseNumber(formData.get("conditional_rain")),
      peak: parseNumber(formData.get("conditional_peak")),
    },
    minimum_charge_brl: parseNumber(formData.get("minimum_charge_brl")),
    max_distance_km: parseNumber(formData.get("max_distance_km")),
    distance_zones_brl: parseDistanceZones(formData.get("distance_zones_brl")),
  };

  const result = await savePricingRules(payload);
  if (result.error) {
    redirect("/admin/pricing?state=error");
  }

  revalidatePath("/admin/pricing");
  redirect("/admin/pricing?state=success");
}

export default async function AdminPricingPage({
  searchParams,
}: AdminPricingPageProps): Promise<JSX.Element> {
  const result = await loadPricingRules();
  const state = searchParams?.state;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Precificacao</h1>
        <p className="text-sm text-muted">Edicao versionada das regras de frete (admin only).</p>
      </header>

      {state === "success" ? (
        <p className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm text-primary">
          Regras atualizadas com sucesso.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          Falha ao atualizar regras de preco.
        </p>
      ) : null}
      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data ? <PricingRulesSummary rules={result.data} /> : null}

      {result.data ? (
        <form
          action={updatePricingRulesAction}
          className="space-y-4 rounded-lg border border-border bg-surface-1 p-4 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Urgencia padrao
              </span>
              <input
                name="urgency_padrao"
                type="number"
                step="0.01"
                defaultValue={result.data.urgency_addon_brl.padrao}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Urgencia urgente
              </span>
              <input
                name="urgency_urgente"
                type="number"
                step="0.01"
                defaultValue={result.data.urgency_addon_brl.urgente}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Urgencia agendado
              </span>
              <input
                name="urgency_agendado"
                type="number"
                step="0.01"
                defaultValue={result.data.urgency_addon_brl.agendado}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Domingo
              </span>
              <input
                name="conditional_sunday"
                type="number"
                step="0.01"
                defaultValue={result.data.conditional_addons_brl.sunday}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Feriado
              </span>
              <input
                name="conditional_holiday"
                type="number"
                step="0.01"
                defaultValue={result.data.conditional_addons_brl.holiday}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Chuva
              </span>
              <input
                name="conditional_rain"
                type="number"
                step="0.01"
                defaultValue={result.data.conditional_addons_brl.rain}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Pico
              </span>
              <input
                name="conditional_peak"
                type="number"
                step="0.01"
                defaultValue={result.data.conditional_addons_brl.peak}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Cobranca minima
              </span>
              <input
                name="minimum_charge_brl"
                type="number"
                step="0.01"
                defaultValue={result.data.minimum_charge_brl}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Distancia maxima (km)
              </span>
              <input
                name="max_distance_km"
                type="number"
                step="0.1"
                defaultValue={result.data.max_distance_km}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Zonas (JSON)
            </span>
            <textarea
              name="distance_zones_brl"
              rows={8}
              defaultValue={JSON.stringify(result.data.distance_zones_brl, null, 2)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-foreground"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Salvar nova versao
          </button>
        </form>
      ) : null}
    </section>
  );
}
