import Link from "next/link";

export const metadata = {
  title: "Termos de uso",
  description: "Termos de uso da plataforma Roodi. Regras operacionais, financeiras e de conduta.",
};

export default function TermosPage() {
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
              Termos de uso
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
          <div className="prose-container space-y-12">
            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">1. Aceitação dos termos</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Ao acessar ou utilizar a plataforma Roodi, incluindo o aplicativo mobile e a plataforma web, você concorda com estes Termos de Uso. Caso não concorde com qualquer disposição, interrompa o uso imediatamente. O uso continuado constitui aceitação integral.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">2. Descrição do serviço</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                O Roodi é uma plataforma de intermediação de entregas sob demanda. O comércio cria chamados de entrega, e riders independentes aceitam e executam essas entregas. O Roodi não é uma empresa de logística — atuamos como intermediário tecnológico entre comércios e entregadores.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Cotação baseada em matriz de bairros com fallback determinístico",
                  "Pagamento por chamado via sistema de créditos (paridade 1:1 com Real)",
                  "Tracking por estados operacionais — sem GPS contínuo",
                  "Taxa da plataforma fixa e publicada (R$ 1 por entrega)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">3. Cadastro e responsabilidades</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. Cada usuário é responsável pela segurança de suas credenciais. O Roodi reserva-se o direito de suspender ou encerrar contas que violem estes termos ou apresentem comportamento abusivo.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/[0.03] p-5">
                  <h3 className="text-sm font-bold text-foreground">Comércio</h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    Responsável pelas informações do chamado (endereço, produtos, urgência), manutenção de créditos e confirmação de recebimento.
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-5">
                  <h3 className="text-sm font-bold text-foreground">Rider</h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    Responsável pela execução da entrega conforme os estados operacionais, coleta do código de confirmação e cumprimento dos padrões de conduta.
                  </p>
                </div>
              </div>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">4. Política financeira</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                O comércio adquire créditos para pagar entregas. Cada R$ 1 de crédito equivale a R$ 1 (paridade 1:1). O valor do serviço é descontado dos créditos do comércio no momento da confirmação. O valor pago ao rider é o valor do serviço descontada a taxa da plataforma. Toda transação é registrada e auditável pelo painel administrativo.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">5. Conduta e penalidades</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Espera-se conduta profissional de todos os participantes. Comportamento abusivo, fraude, manipulação de entregas ou qualquer ação que comprometa a integridade operacional está sujeita a penalidades — desde advertência até exclusão permanente da plataforma. Todas as penalidades são baseadas em evidências auditáveis.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">6. Limitação de responsabilidade</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                O Roodi atua como intermediário tecnológico. Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso da plataforma, incluindo perdas, atrasos ou problemas na execução de entregas. A plataforma é fornecida &quot;como está&quot;, sem garantias implícitas de disponibilidade contínua ou ausência de falhas.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">7. Modificações</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                O Roodi pode atualizar estes termos a qualquer momento. Alterações relevantes serão comunicadas via aplicativo ou e-mail. O uso continuado da plataforma após a publicação de alterações constitui aceitação dos novos termos.
              </p>
            </article>

            <article className="glass-panel rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground">8. Contato</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Dúvidas sobre estes termos podem ser direcionadas ao time através da{" "}
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
            <Link href="/privacidade" className="transition-colors hover:text-foreground">Privacidade</Link>
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
