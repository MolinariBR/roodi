"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/tracking", label: "Tracking" },
  { href: "/admin/pricing", label: "Precificacao" },
  { href: "/admin/credits", label: "Creditos" },
  { href: "/admin/payments", label: "Pagamentos" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/notifications", label: "Notificacoes" },
  { href: "/admin/support", label: "Suporte" },
  { href: "/admin/system", label: "Sistema" },
];

const isActive = (pathname: string, href: string): boolean => {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
};

export function AdminSidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacao administrativa" className="space-y-2">
      {NAVIGATION_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast ease-[var(--ease-standard)] ${
              active
                ? "bg-primary-soft text-primary"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
