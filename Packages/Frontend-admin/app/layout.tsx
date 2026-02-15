import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { THEME_MODE_INIT_SCRIPT } from "@core/design-system";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roodi Admin",
  description: "Painel administrativo do Roodi",
};
export const dynamic = "force-dynamic";

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
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
