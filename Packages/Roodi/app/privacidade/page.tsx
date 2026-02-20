import Link from "next/link";

export const metadata = {
  title: "Privacidade",
  description: "Política de privacidade do Roodi. Como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacidadePage() {
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
              Política de privacidade
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
          {/* Privacy commitment banner */}
          <div className="mb-12 glass-panel rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Privacidade por design</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  O Roodi foi construído com minimização de dados como princípio fundamental.
                  Não usamos GPS contínuo no fluxo principal. O tracking é por eventos operacionais, não por localização em tempo real.
                  Coletamos apenas o necessário para operar com segurança e transparência.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">1. Dados que coletamos</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Coletamos dados estritamente necessários para a operação da plataforma:
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/[0.03] p-5">
                  <h3 className="text-sm font-bold text-foreground">Dados de cadastro</h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted">
                    <li>• Nome e informações de contato</li>
                    <li>• Tipo de perfil (comércio ou rider)</li>
                    <li>• Cidade e região de operação</li>
                    <li>• Credenciais de autenticação</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-5">
                  <h3 className="text-sm font-bold text-foreground">Dados operacionais</h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted">
                    <li>• Chamados criados e histórico de entregas</li>
                    <li>• Eventos de estado (aceite, coleta, entrega)</li>
                    <li>• Transações financeiras e uso de créditos</li>
                    <li>• Logs de auditoria</li>
                  </ul>
                </div>
              </div>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">2. Como usamos seus dados</h2>
              <ul className="mt-4 space-y-3">
                {[
                  { purpose: "Autenticação e segurança", detail: "Login, verificação de identidade e proteção contra fraudes." },
                  { purpose: "Operação de entregas", detail: "Cotação, dispatch, tracking por estados e confirmação." },
                  { purpose: "Financeiro", detail: "Processamento de pagamentos, créditos e conciliação." },
                  { purpose: "Suporte", detail: "Resolução de disputas, auditoria e comunicação com usuários." },
                  { purpose: "Melhoria da plataforma", detail: "Análise agregada e anônima para evolução do produto." },
                ].map((item) => (
                  <li key={item.purpose} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{item.purpose}:</span>{" "}
                      <span className="text-sm text-muted">{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">3. O que NÃO fazemos</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  "Não vendemos dados pessoais",
                  "Não usamos GPS contínuo",
                  "Não compartilhamos dados com terceiros para marketing",
                  "Não criamos perfis comportamentais para publicidade",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-4 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">4. Compartilhamento de dados</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Podemos compartilhar dados limitados com:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Provedores de serviço essenciais (processamento de pagamento, infraestrutura cloud)",
                  "Autoridades competentes quando exigido por lei",
                  "Partes em disputas operacionais, limitado aos dados relevantes do caso",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">5. Seus direitos</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Em conformidade com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Acessar seus dados pessoais armazenados",
                  "Solicitar correção de dados incompletos ou desatualizados",
                  "Solicitar exclusão de dados (sujeito a obrigações legais de retenção)",
                  "Revogar consentimento para uso de dados",
                  "Solicitar portabilidade dos dados para outro provedor",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                Para exercer seus direitos, entre em contato através da{" "}
                <Link href="/contato" className="text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 transition-colors hover:decoration-[var(--color-primary)]">
                  página de contato
                </Link>
                .
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">6. Retenção e segurança</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Dados operacionais são retidos enquanto necessários para fins de auditoria e conformidade regulatória.
                Dados de conta são mantidos enquanto a conta estiver ativa. Utilizamos criptografia, controle de acesso e práticas de segurança da informação para proteger seus dados.
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
            <Link href="/cookies" className="transition-colors hover:text-foreground">Cookies</Link>
          </div>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            ← Voltar ao início
          </Link>
        </div>
      </section>
    </div>
  );
}
