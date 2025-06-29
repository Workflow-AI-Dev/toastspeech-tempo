import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@toastspeech_theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Get system theme preference
  const getSystemTheme = (): Theme => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === "dark" ? "dark" : "light";
  };

  // Load theme from storage or use system preference
  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
        setTheme(storedTheme as Theme);
      } else {
        // Use system preference if no stored theme
        const systemTheme = getSystemTheme();
        setTheme(systemTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, systemTheme);
      }
    } catch (error) {
      console.warn("Failed to load theme from storage:", error);
      // Fallback to system theme
      setTheme(getSystemTheme());
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme to storage
  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn("Failed to save theme to storage:", error);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if user hasn't manually set a preference
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedTheme) => {
        if (!storedTheme) {
          const systemTheme = colorScheme === "dark" ? "dark" : "light";
          setTheme(systemTheme);
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  // Load theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Theme colors configuration
export const themeColors = {
  light: {
    background: "#ffffff",
    surface: "#f8f9fa",
    primary: "#3b82f6",
    secondary: "#6b7280",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    card: "#ffffff",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    accent: "#8b5cf6",
  },
  dark: {
    background: "#0f172a",
    surface: "#1e293b",
    primary: "#60a5fa",
    secondary: "#94a3b8",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    card: "#1e293b",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    accent: "#a78bfa",
  },
};

// Helper function to get current theme colors
export const getThemeColors = (theme: Theme) => themeColors[theme];
