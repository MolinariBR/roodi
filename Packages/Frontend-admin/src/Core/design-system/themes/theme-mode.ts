export type ThemeMode = "light" | "dark" | "system";

export const THEME_MODE_STORAGE_KEY = "roodi:frontend-admin:theme-mode";

export const THEME_MODE_INIT_SCRIPT = `
(() => {
  try {
    const key = "${THEME_MODE_STORAGE_KEY}";
    const value = localStorage.getItem(key);
    if (value === "light" || value === "dark") {
      document.documentElement.setAttribute("data-theme", value);
      return;
    }
    document.documentElement.removeAttribute("data-theme");
  } catch (_) {
    document.documentElement.removeAttribute("data-theme");
  }
})();
`;

export function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const mode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return mode === "light" || mode === "dark" || mode === "system" ? mode : "system";
}

export function applyThemeMode(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  if (mode === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }

  document.documentElement.setAttribute("data-theme", mode);
}

export function persistThemeMode(mode: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
}
