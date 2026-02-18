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
      setErrorMessage("Preencha os campos obrigatorios para enviar.");
      return;
    }

    if (!apiBaseUrl) {
      setStatus("error");
      setErrorMessage("Configuracao de API ausente. Tente novamente em instantes.");
      return;
    }

    let endpoint: string;
    try {
      endpoint = new URL("/v1/public/leads", apiBaseUrl).toString();
    } catch {
      setStatus("error");
      setErrorMessage("API invalida. Tente novamente em instantes.");
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
      setErrorMessage("Nao foi possivel enviar agora. Verifique sua conexao e tente novamente.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {status === "success" ? (
        <div className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
          <p className="text-base font-bold text-foreground">Recebido.</p>
          <p className="mt-2 text-sm text-muted">
            Seu contato foi enviado. Em breve retornamos com os proximos passos.
          </p>
          <button
            className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
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
            <p className="rounded-2xl border border-border bg-surface-1 px-4 py-3 text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-4 rounded-2xl border border-border bg-surface-1 p-6 shadow-sm md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Nome
              <input
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
                name="name"
                placeholder="Seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Contato (email ou WhatsApp)
              <input
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
                name="contact"
                placeholder="voce@empresa.com ou +55 11 99999-9999"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
              Perfil
              <select
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
                name="lead_type"
                value={leadType}
                onChange={(event) => setLeadType(resolveDefaultLeadType(event.target.value))}
              >
                <option value="commerce">Comercio</option>
                <option value="rider">Rider</option>
                <option value="partnership">Parceria</option>
                <option value="other">Outro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
              Mensagem (opcional)
              <textarea
                className="min-h-28 resize-y rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
                name="message"
                placeholder="Conte brevemente seu cenario (cidade, volume, necessidade)."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <p className="text-xs text-muted">Ao enviar, voce concorda em ser contatado pelo time Roodi.</p>
              <button
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-fast hover:opacity-90 disabled:opacity-60"
                type="submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
