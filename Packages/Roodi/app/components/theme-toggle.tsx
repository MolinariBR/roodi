"use client";

import { useEffect, useState } from "react";
import { applyThemeMode, persistThemeMode, readThemeMode, type ThemeMode } from "@core/design-system";

const nextThemeMode = (mode: ThemeMode): ThemeMode => {
  if (mode === "system") return "light";
  if (mode === "light") return "dark";
  return "system";
};

const labelForMode = (mode: ThemeMode): string => {
  if (mode === "light") return "Tema claro";
  if (mode === "dark") return "Tema escuro";
  return "Tema do sistema";
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    setMode(readThemeMode());
  }, []);

  const onToggle = () => {
    const updated = nextThemeMode(mode);
    setMode(updated);
    applyThemeMode(updated);
    persistThemeMode(updated);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className="roodi-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-surface-1 px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-surface-2"
      aria-label={`Alternar tema (atual: ${labelForMode(mode)})`}
      title={labelForMode(mode)}
    >
      <span className="grid place-items-center">
        {mode === "dark" ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M21 13.2A8.5 8.5 0 0 1 10.8 3a7.3 7.3 0 1 0 10.2 10.2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        ) : mode === "light" ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M7 7a5 5 0 0 1 7-4.6A5.8 5.8 0 0 0 12.8 11 5 5 0 0 1 7 7Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M14.5 20.5A7.5 7.5 0 1 0 20.5 9a6.6 6.6 0 0 1-6 11.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}

