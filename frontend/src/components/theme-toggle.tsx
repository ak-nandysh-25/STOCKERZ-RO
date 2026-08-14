import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "dark" | "light";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("stockerz-theme") as Theme | null;
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("stockerz-theme", next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`grid h-9 w-9 place-items-center rounded-xl glass text-muted-foreground transition ${className}`}
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative grid h-9 w-9 place-items-center rounded-xl glass text-foreground transition hover:bg-white/10 active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-sky-400 transition-all duration-300" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-all duration-300" />
      )}
    </button>
  );
}
