// src/theme/tokens.ts

export const radius = {
  sm: 6, // --radius-sm: calc(0.625rem * 0.6)
  md: 8, // --radius-md: calc(0.625rem * 0.8)
  lg: 10, // --radius-lg: 0.625rem
  xl: 14, // --radius-xl: calc(0.625rem * 1.4)
  "2xl": 18, // --radius-2xl: calc(0.625rem * 1.8)
  "3xl": 22, // --radius-3xl: calc(0.625rem * 2.2)
  "4xl": 26, // --radius-4xl: calc(0.625rem * 2.6)
  full: 9999,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12, // px-3
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  11: 44, // h-11
  12: 48,
  16: 64,
} as const;

export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

export const lightColors = {
  background: "#F8FAFC",
  foreground: "#0F172A",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",
  card: "#FFFFFF",
  cardForeground: "#0F172A",
  popover: "#FFFFFF",
  popoverForeground: "#0F172A",

  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primarySoft: "#EEF2FF",
  primaryForeground: "#FFFFFF",

  secondary: "#0D9488",
  secondarySoft: "#CCFBF1",
  secondaryForeground: "#FFFFFF",

  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  accent: "#EEF2FF",
  accentForeground: "#4F46E5",

  destructive: "#EF4444",
  border: "#E2E8F0",
  input: "#E2E8F0",
  ring: "#4F46E5",

  success: "#10B981",
  successSoft: "#ECFDF5",
  warning: "#F59E0B",
  warningSoft: "#FFFBEB",
  error: "#EF4444",
  errorSoft: "#FEF2F2",
  info: "#0EA5E9",
  infoSoft: "#F0F9FF",
} as const;

export const darkColors: ThemeColors = {
  background: "#0B1120",
  foreground: "#F8FAFC",
  surface: "#111827",
  surfaceSecondary: "#172033",
  card: "#111827",
  cardForeground: "#F8FAFC",
  popover: "#111827",
  popoverForeground: "#F8FAFC",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  primary: "#6366F1",
  primaryHover: "#818CF8",
  primarySoft: "#1E1B4B",
  primaryForeground: "#F8FAFC",

  secondary: "#14B8A6",
  secondarySoft: "#134E4A",
  secondaryForeground: "#0B1120",

  muted: "#172033",
  mutedForeground: "#94A3B8",
  accent: "#1E1B4B",
  accentForeground: "#818CF8",

  destructive: "#EF4444",
  border: "#1F2937",
  input: "#1F2937",
  ring: "#6366F1",

  success: "#10B981",
  successSoft: "#0F2E22",
  warning: "#F59E0B",
  warningSoft: "#3A2A0C",
  error: "#EF4444",
  errorSoft: "#3B1414",
  info: "#0EA5E9",
  infoSoft: "#0C2A3A",
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;
