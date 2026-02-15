import type { PricingRules } from "@core/api-client/admin-api.server";
import { formatCurrencyBRL } from "@core/shared/format";

type PricingRulesSummaryProps = {
  rules: PricingRules;
};

export function PricingRulesSummary({ rules }: PricingRulesSummaryProps): JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Regras atuais</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md bg-surface-2 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Urgencia</p>
          <p className="mt-1 text-sm text-foreground">
            Padrao: {formatCurrencyBRL(rules.urgency_addon_brl.padrao)}
          </p>
          <p className="text-sm text-foreground">
            Urgente: {formatCurrencyBRL(rules.urgency_addon_brl.urgente)}
          </p>
          <p className="text-sm text-foreground">
            Agendado: {formatCurrencyBRL(rules.urgency_addon_brl.agendado)}
          </p>
        </article>

        <article className="rounded-md bg-surface-2 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Condicionais</p>
          <p className="mt-1 text-sm text-foreground">
            Domingo: {formatCurrencyBRL(rules.conditional_addons_brl.sunday)}
          </p>
          <p className="text-sm text-foreground">
            Feriado: {formatCurrencyBRL(rules.conditional_addons_brl.holiday)}
          </p>
          <p className="text-sm text-foreground">
            Chuva: {formatCurrencyBRL(rules.conditional_addons_brl.rain)}
          </p>
          <p className="text-sm text-foreground">
            Pico: {formatCurrencyBRL(rules.conditional_addons_brl.peak)}
          </p>
        </article>

        <article className="rounded-md bg-surface-2 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Minimo</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {formatCurrencyBRL(rules.minimum_charge_brl)}
          </p>
        </article>

        <article className="rounded-md bg-surface-2 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Distancia maxima</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {rules.max_distance_km.toFixed(1)} km
          </p>
        </article>
      </div>
    </section>
  );
}
