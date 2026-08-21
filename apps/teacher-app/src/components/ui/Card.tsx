// src/components/ui/Card.tsx
import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export function Card({ style, children, ...props }: ViewProps) {
  const { colors, radius, spacing, shadows } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius["2xl"],
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[6],
          ...shadows.md,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
