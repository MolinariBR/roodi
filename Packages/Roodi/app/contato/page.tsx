import { LeadForm } from "@modules/leads/presentation/lead-form";

export const metadata = {
  title: "Contato",
  description: "Fale com o time Roodi para entrar no piloto (comercio, rider ou parcerias).",
};

type ContatoPageProps = {
  searchParams?: {
    type?: string;
  };
};

const resolveLeadType = (value: string | undefined) => {
  return value === "commerce" || value === "rider" || value === "partnership" || value === "other"
    ? value
    : undefined;
};

export default function ContatoPage({ searchParams }: ContatoPageProps) {
  const defaultLeadType = resolveLeadType(searchParams?.type);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <section className="grid gap-10 md:grid-cols-2 md:items-start">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contato</p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Vamos conversar sobre sua operacao.
          </h1>
          <p className="max-w-xl text-base text-muted md:text-lg">
            Deixe um contato e uma breve mensagem. O time retorna com orientacao e proximos passos para entrar no piloto.
          </p>

          <div className="grid gap-3 rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <p className="text-sm font-bold text-foreground">Sugestoes de mensagem</p>
            <ul className="grid gap-2 text-sm text-muted">
              <li>Comercio: cidade, volume diario e janela de pico.</li>
              <li>Rider: cidade e disponibilidade.</li>
              <li>Parcerias: integracao, operacao ou novos bairros/cidades.</li>
            </ul>
          </div>
        </header>

        <div>
          <LeadForm defaultLeadType={defaultLeadType} />
        </div>
      </section>
    </div>
  );
}
