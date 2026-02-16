import { redirect } from "next/navigation";
import { z } from "zod";

import { persistAdminSession } from "@core/auth/admin-session.cookies";
import { resolveApiBaseUrl } from "@core/auth/admin-session.shared";
import { redirectIfAuthenticatedAdmin } from "@core/auth/admin-access.server";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export const dynamic = "force-dynamic";

const loginFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8).max(128),
});

const authLoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_in: z.number().int().positive(),
    token_type: z.literal("Bearer"),
    user: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.literal("admin"),
      status: z.enum(["active", "suspended", "blocked"]),
    }),
  }),
});

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Sessao invalida para acesso administrativo.",
  invalid_payload: "Preencha e-mail e senha validos.",
  invalid_credentials: "Credenciais invalidas para administrador.",
  session_rejected: "Sua conta admin esta inativa no momento.",
  backend_unavailable: "Nao foi possivel conectar ao backend.",
  backend_contract_error: "Resposta inesperada do backend de autenticacao.",
};

const resolveErrorMessage = (errorCode: string | undefined): string | null => {
  if (!errorCode) {
    return null;
  }

  return ERROR_MESSAGES[errorCode] ?? "Falha no login administrativo.";
};

const loginAction = async (formData: FormData): Promise<void> => {
  "use server";

  const parsedPayload = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedPayload.success) {
    redirect("/admin/login?error=invalid_payload");
  }

  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    redirect("/admin/login?error=backend_unavailable");
  }

  let endpoint: URL;
  try {
    endpoint = new URL("/v1/auth/login", apiBaseUrl);
  } catch {
    redirect("/admin/login?error=backend_unavailable");
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: parsedPayload.data.email,
        password: parsedPayload.data.password,
        role: "admin",
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirect("/admin/login?error=invalid_credentials");
      }

      if (response.status === 403) {
        redirect("/admin/login?error=session_rejected");
      }

      redirect("/admin/login?error=backend_unavailable");
    }

    const responseBody: unknown = await response.json();
    const parsedAuthResponse = authLoginResponseSchema.safeParse(responseBody);

    if (!parsedAuthResponse.success) {
      redirect("/admin/login?error=backend_contract_error");
    }

    const { data } = parsedAuthResponse.data;
    persistAdminSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpiresInSeconds: data.expires_in,
      identity: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      },
    });

    redirect("/admin/dashboard");
  } catch {
    redirect("/admin/login?error=backend_unavailable");
  }
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  await redirectIfAuthenticatedAdmin();
  const errorMessage = resolveErrorMessage(searchParams?.error);

  return (
    <section className="space-y-4">
      {errorMessage ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}

      <form action={loginAction} className="space-y-4 rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            E-mail administrativo
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
            id="email"
            name="email"
            placeholder="admin@roodi.app"
            required
            type="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Senha
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-fast focus:border-primary"
            id="password"
            name="password"
            placeholder="********"
            required
            type="password"
          />
        </div>

        <button
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity duration-fast hover:opacity-90"
          type="submit"
        >
          Entrar no painel
        </button>
      </form>
    </section>
  );
}
