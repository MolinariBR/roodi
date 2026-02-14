tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#19b3e6",
        secondary: "#10b981",
        accent: "#f59e0b",
        "background-light": "#f6f7f8",
        "background-dark": "#111d21",
        "surface-1": "#10191d",
        "surface-2": "#182226",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        "glass-bg": "rgba(255, 255, 255, 0.03)",
        info: "#0ea5e9",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        slate: {
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155"
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb"
        },
        cyan: {
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4"
        },
        emerald: {
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981"
        },
        orange: {
          400: "#fb923c",
          500: "#f97316"
        },
        purple: {
          400: "#c084fc",
          500: "#a855f7"
        },
        yellow: {
          400: "#facc15"
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b"
        },
        red: {
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444"
        },
        green: {
          500: "#22c55e"
        }
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      },
      fontSize: {
        "3xs": "0.5rem",
        "2xs": "0.625rem",
        "2xs-plus": "0.6875rem",
        "icon-sm": "1.125rem",
        "icon-md": "1.25rem",
        "icon-lg": "1.75rem",
        "icon-xl": "1.875rem",
        "icon-2xl": "2.625rem"
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        panel: "1.8rem",
        card: "2rem",
        sheet: "2.5rem",
        full: "9999px"
      },
      backdropBlur: {
        xs: "2px"
      },
      boxShadow: {
        "primary-soft": "0 0 20px rgba(25, 179, 230, 0.15)",
        "primary-md": "0 4px 20px rgba(25, 179, 230, 0.3)",
        "primary-lg": "0 4px 25px rgba(25, 179, 230, 0.5)",
        "primary-dot": "0 0 10px rgba(25, 179, 230, 0.8)",
        "primary-strong": "0 0 20px rgba(25, 179, 230, 0.4)",
        "primary-ring": "0 0 15px rgba(25, 179, 230, 0.4)",
        "success-ring": "0 0 15px rgba(34, 197, 94, 0.4)",
        "warning-soft": "0 0 15px rgba(249, 115, 22, 0.1)",
        "gold-soft": "0 0 15px rgba(250, 204, 21, 0.15)",
        "panel-md": "0 10px 30px rgba(0, 0, 0, 0.5)",
        "panel-xl": "0 20px 50px rgba(0, 0, 0, 0.6)",
        "panel-top": "0 -15px 50px rgba(0, 0, 0, 0.6)"
      },
      ringWidth: {
        6: "6px"
      },
      scale: {
        97: "0.97",
        98: "0.98",
        101: "1.01",
        102: "1.02"
      },
      letterSpacing: {
        brand: "0.18em",
        nav: "0.2em"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.96)" },
          "50%": { opacity: "0.8", transform: "scale(1.03)" }
        },
        loadingMove: {
          "0%": { transform: "translateX(-5%)" },
          "50%": { transform: "translateX(105%)" },
          "100%": { transform: "translateX(210%)" }
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        loadingMove: "loadingMove 1.5s ease-in-out infinite",
        shine: "shine 2.8s linear infinite"
      }
    }
  }
};
