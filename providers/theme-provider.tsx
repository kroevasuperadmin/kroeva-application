import { useStorage } from "@/providers/storage-provider";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

interface ThemeState {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => void;
}

const lightColors: ThemeColors = {
  primary: "#0B1F3B",
  background: "#FFFFFF",
  card: "#F8F9FA",
  text: "#000000",
  textSecondary: "#6B6B6B",
  border: "#E0E0E0",
  accent: "#1AC6C6",
};

const darkColors: ThemeColors = {
  primary: "#0B1F3B",
  background: "#0A0F1B",
  card: "#1A2332",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  border: "#2A3442",
  accent: "#1AC6C6",
};

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { getItem, setItem } = useStorage();

  const loadTheme = useCallback(async () => {
    try {
      const theme = await getItem("theme");
      if (theme && typeof theme === 'string') {
        setIsDarkMode(theme.trim() === "dark");
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }, [getItem]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleDarkMode = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await setItem("theme", newMode ? "dark" : "light");
  }, [isDarkMode, setItem]);

  return useMemo(() => ({
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleDarkMode,
  }), [isDarkMode, toggleDarkMode]);
});