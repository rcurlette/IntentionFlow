import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ColorTheme = "vibrant" | "accessible";

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowtracker-theme");
      if (stored === "light" || stored === "dark") return stored;
    }
    return "light";
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowtracker-color-theme");
      if (stored === "vibrant" || stored === "accessible") return stored;
    }
    return "accessible"; // Default to accessible for better UX
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "theme-vibrant", "theme-accessible");

    // Add current theme classes
    root.classList.add(theme);
    root.classList.add(`theme-${colorTheme}`);

    // Store in localStorage
    localStorage.setItem("flowtracker-theme", theme);
    localStorage.setItem("flowtracker-color-theme", colorTheme);
  }, [theme, colorTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, colorTheme, setTheme, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
