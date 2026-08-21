import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface StatCardProps {
  label: string;
  value: number;
  variant: "warning" | "success" | "error";
}

export function StatCard({ label, value, variant }: StatCardProps) {
  const { colors, radius, spacing, fontFamily } = useTheme();

  const variantColor = {
    warning: colors.warning,
    success: colors.success,
    error: colors.error,
  }[variant];
  const variantSoft = {
    warning: colors.warningSoft,
    success: colors.successSoft,
    error: colors.errorSoft,
  }[variant];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: variantSoft,
        borderRadius: radius.xl,
        paddingVertical: spacing[3],
        alignItems: "center",
        gap: 2,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.bold,
          fontSize: 20,
          color: variantColor,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fontFamily.medium,
          fontSize: 11,
          color: variantColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
