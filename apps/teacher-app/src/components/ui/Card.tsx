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
          padding: spacing[5],
          ...shadows.sm,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
