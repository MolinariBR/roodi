import { LeadForm } from "@modules/leads/presentation/lead-form";

export const metadata = {
  title: "Contato",
  description:
    "Fale com o time Roodi. Comerciante, rider ou parceiro — entre no piloto em poucos passos.",
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

const infoCards = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "O que nos contar",
    items: [
      "Comércio: cidade, volume diário e janela de pico",
      "Rider: cidade e disponibilidade de horários",
      "Parcerias: integração, operação ou novos bairros",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "O que acontece depois",
    items: [
      "Validamos seu cenário e região",
      "Definimos regras iniciais de operação",
      "Liberamos acesso ao piloto com onboarding",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Tempo de resposta",
    items: [
      "Retornamos em até 24h úteis",
      "Sem compromisso e sem spam",
      "Sua cidade pode entrar no próximo lote",
    ],
  },
];

export default function ContatoPage({ searchParams }: ContatoPageProps) {
  const defaultLeadType = resolveLeadType(searchParams?.type);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="text-center">
            <p className="section-label">Contato</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl" style={{ letterSpacing: "-0.04em" }}>
              Vamos conversar sobre{" "}
              <span className="gradient-text">sua operação</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              Deixe um contato e uma breve mensagem. O time retorna com
              orientação e próximos passos para entrar no piloto.
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards + Form */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            {/* Left — Info cards */}
            <div className="space-y-6">
              {infoCards.map((card) => (
                <div key={card.title} className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {card.icon}
                    </div>
                    <h2 className="text-base font-bold text-foreground">{card.title}</h2>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
                        <span className="text-sm text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right — Lead Form */}
            <div>
              <LeadForm defaultLeadType={defaultLeadType} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
