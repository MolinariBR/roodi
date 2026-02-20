"use client";

import { type FormEvent, useMemo, useState } from "react";
import { z } from "zod";

type LeadType = "commerce" | "rider" | "partnership" | "other";

const leadFormSchema = z.object({
  name: z.string().trim().min(1).max(160),
  contact: z.string().trim().min(1).max(180),
  lead_type: z.enum(["commerce", "rider", "partnership", "other"]),
  message: z.string().trim().max(4000).optional(),
});

type LeadFormProps = {
  defaultLeadType?: LeadType;
};

const resolveApiBaseUrl = (): string | null => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl || baseUrl.trim().length === 0) {
    return null;
  }
  return baseUrl;
};

const resolveDefaultLeadType = (value: unknown): LeadType => {
  return value === "commerce" || value === "rider" || value === "partnership" || value === "other"
    ? value
    : "commerce";
};

const readApiErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const error = (payload as Record<string, unknown>).error;
  if (!error || typeof error !== "object" || Array.isArray(error)) {
    return null;
  }

  const message = (error as Record<string, unknown>).message;
  return typeof message === "string" && message.trim().length > 0 ? message : null;
};

export function LeadForm({ defaultLeadType }: LeadFormProps) {
  const apiBaseUrl = useMemo(() => resolveApiBaseUrl(), []);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [leadType, setLeadType] = useState<LeadType>(resolveDefaultLeadType(defaultLeadType));
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setStatus("submitting");

    const parsed = leadFormSchema.safeParse({
      name,
      contact,
      lead_type: leadType,
      message: message.trim().length ? message : undefined,
    });

    if (!parsed.success) {
      setStatus("error");
      setErrorMessage("Preencha os campos obrigatórios para enviar.");
      return;
    }

    if (!apiBaseUrl) {
      setStatus("error");
      setErrorMessage("Configuração de API ausente. Tente novamente em instantes.");
      return;
    }

    let endpoint: string;
    try {
      endpoint = new URL("/v1/public/leads", apiBaseUrl).toString();
    } catch {
      setStatus("error");
      setErrorMessage("API inválida. Tente novamente em instantes.");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-lead-source": typeof window !== "undefined" ? window.location.href : "roodi-landing",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as unknown;
        const messageFromApi = readApiErrorMessage(payload);

        setStatus("error");
        setErrorMessage(typeof messageFromApi === "string" ? messageFromApi : "Falha ao enviar. Tente novamente.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Não foi possível enviar agora. Verifique sua conexão e tente novamente.");
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted/50 focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/10";

  const labelClasses = "grid gap-2 text-sm font-semibold text-foreground";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {status === "success" ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-xl font-bold text-foreground">Mensagem enviada!</p>
          <p className="mt-2 text-sm text-muted">
            Seu contato foi recebido. Em breve retornamos com os próximos passos.
          </p>
          <button
            className="btn-secondary mt-6"
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
              setName("");
              setContact("");
              setLeadType(resolveDefaultLeadType(defaultLeadType));
              setMessage("");
            }}
          >
            Enviar outro contato
          </button>
        </div>
      ) : (
        <>
          {errorMessage ? (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          ) : null}

          <div className="glass-panel grid gap-5 rounded-2xl p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                Nome
                <input
                  className={inputClasses}
                  name="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoComplete="name"
                />
              </label>

              <label className={labelClasses}>
                Contato (email ou WhatsApp)
                <input
                  className={inputClasses}
                  name="contact"
                  placeholder="voce@empresa.com ou +55 11 99999-9999"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
            </div>

            <label className={labelClasses}>
              Perfil
              <select
                className={inputClasses}
                name="lead_type"
                value={leadType}
                onChange={(event) => setLeadType(resolveDefaultLeadType(event.target.value))}
              >
                <option value="commerce">Comércio</option>
                <option value="rider">Rider (entregador)</option>
                <option value="partnership">Parceria</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className={labelClasses}>
              Mensagem (opcional)
              <textarea
                className={`${inputClasses} min-h-28 resize-y`}
                name="message"
                placeholder="Conte brevemente seu cenário (cidade, volume, necessidade)."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted/60">
                Ao enviar, você concorda em ser contatado pelo time Roodi.
              </p>
              <button
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  "Enviar mensagem →"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
