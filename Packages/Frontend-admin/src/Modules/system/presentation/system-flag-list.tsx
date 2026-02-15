import type { SystemFlag } from "@core/api-client/admin-api.server";

type SystemFlagListProps = {
  flags: SystemFlag[];
};

export function SystemFlagList({ flags }: SystemFlagListProps): JSX.Element {
  return (
    <div className="grid gap-3">
      {flags.map((flag) => (
        <article
          key={flag.key}
          className="rounded-lg border border-border bg-surface-1 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{flag.key}</p>
              <p className="text-xs text-muted">{flag.description ?? "-"}</p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                flag.enabled ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted"
              }`}
            >
              {flag.enabled ? "ativo" : "inativo"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
