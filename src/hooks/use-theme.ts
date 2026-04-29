import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
const KEY = "plannr-theme";

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** useTheme — persisted dark/light mode toggle. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialize on mount (avoids SSR mismatch)
  useEffect(() => {
    const initial = getInitial();
    setTheme(initial);
    apply(initial);
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
  }, []);

  const toggle = useCallback(() => {
    update(theme === "dark" ? "light" : "dark");
  }, [theme, update]);

  return { theme, setTheme: update, toggle };
}
