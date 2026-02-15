import { SignIn } from "@clerk/nextjs";
import { redirectIfAuthenticatedAdmin } from "@core/auth/admin-access.server";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
  };
};
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Sua conta nao possui permissao de administrador valida no backend.",
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  await redirectIfAuthenticatedAdmin();

  const errorMessage = searchParams?.error ? ERROR_MESSAGES[searchParams.error] : undefined;

  return (
    <section className="space-y-3">
      {errorMessage ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}
      <SignIn
        path="/admin/login"
        routing="path"
        forceRedirectUrl="/admin/dashboard"
        signUpUrl="/admin/login"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "w-full rounded-xl border border-border bg-surface-1 shadow-sm",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted",
            socialButtonsBlockButton:
              "border border-border bg-surface-2 text-foreground hover:bg-surface-3",
            dividerLine: "bg-border",
            dividerText: "text-muted",
            formFieldInput:
              "border border-border bg-surface-2 text-foreground focus:border-primary focus:ring-primary",
            formFieldLabel: "text-foreground",
            footerActionText: "text-muted",
            footerActionLink: "text-primary hover:text-primary",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-fast ease-[var(--ease-standard)]",
          },
        }}
      />
    </section>
  );
}
