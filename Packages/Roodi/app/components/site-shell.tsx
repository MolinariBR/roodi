"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";

type SiteShellProps = Readonly<{
  children: React.ReactNode;
}>;

const navItems = [
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/para-comerciantes", label: "Comerciantes" },
  { href: "/para-entregadores", label: "Entregadores" },
  { href: "/contato", label: "Contato" },
];

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ─────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "color-mix(in srgb, var(--color-bg) 80%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--glass-border)"
            : "1px solid transparent",
          height: "var(--header-height)",
        }}
      >
        <div className="container-main flex h-full items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <span
              className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl text-sm font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="relative z-10">R</span>
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight">Roodi</p>
              <p className="text-[11px] text-muted hidden sm:block" style={{ letterSpacing: '0.02em' }}>
                Entregas para comércio local
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="roodi-focus-ring relative rounded-xl px-4 py-2 text-[13px] font-medium transition-all duration-300"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full"
                      style={{ background: "var(--gradient-primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contato"
              className="btn-primary hidden sm:inline-flex"
              style={{ padding: "10px 20px", fontSize: "13px", borderRadius: "12px" }}
            >
              Falar com o time
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="roodi-focus-ring relative z-50 grid h-10 w-10 place-items-center rounded-xl md:hidden"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
              aria-label="Menu"
            >
              <div className="flex flex-col gap-[5px]">
                <span
                  className="block h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-300"
                  style={{
                    transform: mobileOpen ? "rotate(45deg) translate(2px, 2px)" : "none",
                  }}
                />
                <span
                  className="block h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-300"
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-300"
                  style={{
                    transform: mobileOpen ? "rotate(-45deg) translate(2px, -2px)" : "none",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="absolute right-0 top-0 bottom-0 w-[280px] p-6 pt-24 animate-fade-in-up"
            style={{
              background: "color-mix(in srgb, var(--color-bg) 95%, transparent)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium transition-colors duration-200"
                  style={{
                    color: pathname === item.href ? "var(--color-primary)" : "var(--color-muted)",
                    background: pathname === item.href ? "rgba(25, 179, 230, 0.06)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="section-divider my-3" />
              <Link href="/contato" className="btn-primary text-center text-sm">
                Falar com o time
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* ── Main ─────────────────────────────── */}
      <main className="w-full" style={{ paddingTop: "var(--header-height)" }}>
        {children}
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--glass-border)" }}>
        <div className="container-main" style={{ paddingTop: 64, paddingBottom: 48 }}>
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-xs font-black text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  R
                </span>
                <p className="text-sm font-bold tracking-tight">Roodi</p>
              </div>
              <p className="text-[13px] leading-relaxed text-muted" style={{ maxWidth: 240 }}>
                Plataforma de entregas sob demanda para comércio local. Operação transparente e justa.
              </p>
            </div>

            {/* Nav links */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                Plataforma
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/como-funciona" className="link-glow text-[13px] text-muted">
                  Como funciona
                </Link>
                <Link href="/para-comerciantes" className="link-glow text-[13px] text-muted">
                  Para comerciantes
                </Link>
                <Link href="/para-entregadores" className="link-glow text-[13px] text-muted">
                  Para entregadores
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                Suporte
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/contato" className="link-glow text-[13px] text-muted">
                  Contato
                </Link>
                <Link href="/termos" className="link-glow text-[13px] text-muted">
                  Termos de uso
                </Link>
                <Link href="/privacidade" className="link-glow text-[13px] text-muted">
                  Privacidade
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                Legal
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/cookies" className="link-glow text-[13px] text-muted">
                  Cookies
                </Link>
                <p className="text-[12px] text-muted" style={{ paddingTop: 8, opacity: 0.6 }}>
                  © {new Date().getFullYear()} Roodi
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="section-divider" style={{ marginTop: 48, marginBottom: 24 }} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-muted" style={{ opacity: 0.5 }}>
              Projetado para comércio local • Imperatriz, MA
            </p>
            <div className="flex items-center gap-4">
              <span className="tag">
                <span className="tag-dot animate-pulse-dot" style={{ background: "var(--color-success)" }} />
                Operacional
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
