import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { THEME_MODE_INIT_SCRIPT } from "@core/design-system";
import { SiteShell } from "./components/site-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Roodi — Entregas sob demanda para comércio local",
    template: "%s | Roodi",
  },
  description:
    "Plataforma de entregas sob demanda com operação transparente, tracking por estados e preço justo. Sem algoritmo secreto.",
  metadataBase: new URL("https://roodi.app"),
  openGraph: {
    title: "Roodi — Entregas sob demanda para comércio local",
    description:
      "Comércio cria o chamado e acompanha cada etapa. Rider opera com clareza e justiça. Sem algoritmo secreto.",
    url: "https://roodi.app",
    siteName: "Roodi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roodi — Entregas sob demanda para comércio local",
    description:
      "Operação transparente, tracking por estados e preço justo para comércio local.",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_MODE_INIT_SCRIPT }} />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
