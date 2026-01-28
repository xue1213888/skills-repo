"use client";

import { useTheme } from "./ThemeProvider";
import { useI18n } from "@/components/I18nProvider";

type ThemeToggleProps = {
  variant?: "icon" | "expanded";
};

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const themeLabel =
    theme === "light" ? t("theme.light") : theme === "dark" ? t("theme.dark") : t("theme.system");

  // Expanded variant for mobile menu
  if (variant === "expanded") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setTheme("light")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            border transition-colors cursor-pointer
            ${theme === "light"
              ? "bg-accent/10 border-accent text-accent"
              : "bg-background-secondary border-border text-foreground hover:bg-card"
            }
          `}
          aria-label={t("theme.light")}
          aria-pressed={theme === "light"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span className="text-sm font-medium">{t("theme.light")}</span>
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            border transition-colors cursor-pointer
            ${theme === "dark"
              ? "bg-accent/10 border-accent text-accent"
              : "bg-background-secondary border-border text-foreground hover:bg-card"
            }
          `}
          aria-label={t("theme.dark")}
          aria-pressed={theme === "dark"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="text-sm font-medium">{t("theme.dark")}</span>
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            border transition-colors cursor-pointer
            ${theme === "system"
              ? "bg-accent/10 border-accent text-accent"
              : "bg-background-secondary border-border text-foreground hover:bg-card"
            }
          `}
          aria-label={t("theme.system")}
          aria-pressed={theme === "system"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-sm font-medium">{t("theme.system")}</span>
        </button>
      </div>
    );
  }

  // Default icon variant
  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border hover:bg-accent/10 transition-colors duration-200 cursor-pointer"
      aria-label={t("themeToggle.ariaLabel", { theme: themeLabel })}
    >
      {/* Sun icon */}
      <svg
        className={`absolute w-4 h-4 transition-all duration-300 ${
          theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon icon */}
      <svg
        className={`absolute w-4 h-4 transition-all duration-300 ${
          theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* System icon */}
      <svg
        className={`absolute w-4 h-4 transition-all duration-300 ${
          theme === "system" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    </button>
  );
}
