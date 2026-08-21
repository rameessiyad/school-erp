// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import {
  lightColors,
  darkColors,
  radius,
  spacing,
  fontFamily,
  shadows,
  ThemeColors,
} from "./tokens";

type ColorSchemeOverride = "light" | "dark" | "system";

interface Theme {
  colors: ThemeColors;
  radius: typeof radius;
  spacing: typeof spacing;
  fontFamily: typeof fontFamily;
  shadows: typeof shadows;
  scheme: "light" | "dark";
}

interface ThemeContextValue extends Theme {
  override: ColorSchemeOverride;
  setOverride: (o: ColorSchemeOverride) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ColorSchemeOverride>("system");

  const scheme: "light" | "dark" =
    override === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : override;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: scheme === "dark" ? darkColors : lightColors,
      radius,
      spacing,
      fontFamily,
      shadows,
      scheme,
      override,
      setOverride,
    }),
    [scheme, override],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
