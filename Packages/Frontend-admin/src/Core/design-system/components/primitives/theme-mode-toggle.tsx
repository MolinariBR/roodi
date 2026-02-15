"use client";

import { useEffect, useState } from "react";
import {
  applyThemeMode,
  persistThemeMode,
  readThemeMode,
  type ThemeMode,
} from "@core/design-system";

type ThemeModeOption = {
  value: ThemeMode;
  label: string;
};

const THEME_MODE_OPTIONS: ThemeModeOption[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export function ThemeModeToggle(): JSX.Element {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const savedMode = readThemeMode();
    setMode(savedMode);
    applyThemeMode(savedMode);
  }, []);

  const selectMode = (nextMode: ThemeMode): void => {
    setMode(nextMode);
    persistThemeMode(nextMode);
    applyThemeMode(nextMode);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-1 p-1">
      {THEME_MODE_OPTIONS.map((option) => {
        const selected = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => selectMode(option.value)}
            aria-pressed={selected}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-fast ease-[var(--ease-standard)] ${
              selected
                ? "bg-primary-soft text-primary"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
