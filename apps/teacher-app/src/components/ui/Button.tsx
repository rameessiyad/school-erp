// src/components/ui/Button.tsx
import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
} from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface ButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({
  label,
  loading,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors, radius, spacing, fontFamily, shadows } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: spacing[11],
          borderRadius: radius.xl,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            variant === "primary" ? colors.primary : colors.surfaceSecondary,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
          ...shadows.sm,
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary"
              ? colors.primaryForeground
              : colors.textPrimary
          }
        />
      ) : (
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: 14,
            color:
              variant === "primary"
                ? colors.primaryForeground
                : colors.textPrimary,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
