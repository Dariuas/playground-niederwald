"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Theme = "summer" | "winter";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("summer");

  useEffect(() => {
    const stored = localStorage.getItem("pg-theme") as Theme | null;
    if (stored === "winter") setThemeState("winter");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("winter", theme === "winter");
    localStorage.setItem("pg-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
