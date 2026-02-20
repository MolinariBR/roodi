import Link from "next/link";

export const metadata = {
  title: "Política de cookies",
  description: "Como o Roodi utiliza cookies para funcionamento e análise da plataforma.",
};

const cookieTypes = [
  {
    name: "Essenciais",
    required: true,
    description: "Necessários para o funcionamento básico da plataforma. Incluem autenticação, preferências de tema e segurança da sessão.",
    examples: ["Sessão de autenticação", "Preferência de tema (claro/escuro)", "Token CSRF"],
  },
  {
    name: "Funcionais",
    required: false,
    description: "Melhoram sua experiência ao lembrar preferências e configurações que você definiu anteriormente.",
    examples: ["Idioma preferido", "Região de operação", "Última página visitada"],
  },
  {
    name: "Analíticos",
    required: false,
    description: "Nos ajudam a entender como a plataforma é utilizada, de forma agregada e anônima. Nenhum dado pessoal é vinculado.",
    examples: ["Páginas mais visitadas", "Tempo médio de sessão", "Taxa de conversão de leads"],
  },
];

export default function CookiesPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-24 md:py-28">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted">
              Legal
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
              Política de cookies
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted">
              Última atualização: Fevereiro de 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
          <div className="space-y-12">
            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">O que são cookies?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles permitem que a plataforma reconheça seu dispositivo e mantenha preferências entre visitas. O Roodi utiliza cookies de forma mínima e transparente, priorizando sua privacidade.
              </p>
            </article>

            {/* Cookie types */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Tipos de cookies que utilizamos</h2>
              <div className="space-y-4">
                {cookieTypes.map((type) => (
                  <article key={type.name} className="glass-panel rounded-2xl p-8 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-foreground">{type.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${type.required
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "bg-white/[0.06] text-muted"
                            }`}>
                            {type.required ? "Obrigatório" : "Opcional"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted">{type.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {type.examples.map((example) => (
                        <span key={example} className="inline-flex items-center rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs text-muted">
                          {example}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">Como gerenciar cookies</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Você pode gerenciar ou desativar cookies através das configurações do seu navegador. Note que a desativação de cookies essenciais pode impedir o funcionamento correto da plataforma. Cookies analíticos e funcionais podem ser desativados sem comprometer as funcionalidades básicas.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  { browser: "Chrome", path: "Configurações → Privacidade e segurança → Cookies" },
                  { browser: "Firefox", path: "Opções → Privacidade e Segurança → Cookies" },
                  { browser: "Safari", path: "Preferências → Privacidade → Cookies" },
                  { browser: "Edge", path: "Configurações → Cookies e permissões do site" },
                ].map((b) => (
                  <div key={b.browser} className="rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{b.browser}</p>
                    <p className="mt-0.5 text-xs text-muted">{b.path}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">Cookies de terceiros</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                A plataforma pode utilizar serviços de terceiros que definem seus próprios cookies (por exemplo, provedores de análise). Estes cookies estão sujeitos às políticas de privacidade dos respectivos provedores. O Roodi não controla como esses terceiros tratam os dados coletados.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">Alterações</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas via plataforma. O uso continuado após publicação de alterações constitui aceitação da política atualizada.
              </p>
              <p className="mt-4 text-sm text-muted">
                Dúvidas? Entre em contato através da{" "}
                <Link href="/contato" className="text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 transition-colors hover:decoration-[var(--color-primary)]">
                  página de contato
                </Link>
                .
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer navigation */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/termos" className="transition-colors hover:text-foreground">Termos de uso</Link>
            <Link href="/privacidade" className="transition-colors hover:text-foreground">Privacidade</Link>
          </div>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            ← Voltar ao início
          </Link>
        </div>
      </section>
    </div>
  );
}
