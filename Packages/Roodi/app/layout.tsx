import type { Metadata } from "next";
import { THEME_MODE_INIT_SCRIPT } from "@core/design-system";
import { SiteShell } from "./components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Roodi",
    template: "%s | Roodi",
  },
  description: "Plataforma para comercios acionarem riders com operacao simples, previsivel e segura.",
  metadataBase: new URL("https://roodi.app"),
  openGraph: {
    title: "Roodi",
    description: "Entrega inteligente para comercio local.",
    url: "https://roodi.app",
    siteName: "Roodi",
    type: "website",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_MODE_INIT_SCRIPT }} />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
