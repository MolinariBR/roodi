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
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border bg-background roodi-noise">
        <div className="absolute inset-0 roodi-hero-bg" aria-hidden="true" />
        <div className="absolute inset-0 roodi-grid" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contato</p>
            <h1 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-6xl">
              Vamos conversar sobre sua operacao.
            </h1>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Deixe um contato e uma breve mensagem. O time retorna com orientacao e proximos passos para entrar no piloto.
            </p>
          </header>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="space-y-4">
            <div className="roodi-panel rounded-3xl p-6">
              <p className="text-sm font-bold text-foreground">Sugestoes de mensagem</p>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                <li>Comercio: cidade, volume diario e janela de pico.</li>
                <li>Rider: cidade e disponibilidade.</li>
                <li>Parcerias: integracao, operacao ou novos bairros/cidades.</li>
              </ul>
            </div>

            <div className="roodi-panel rounded-3xl p-6">
              <p className="text-sm font-bold text-foreground">O que acontece depois?</p>
              <p className="mt-2 text-sm text-muted">
                A equipe valida seu cenario e orienta o melhor caminho: piloto por regiao, regras iniciais e onboarding de acesso.
              </p>
            </div>
          </div>

          <div>
            <LeadForm defaultLeadType={defaultLeadType} />
          </div>
        </div>
      </section>
    </div>
  );
}
