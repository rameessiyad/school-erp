// src/components/ui/IconBox.tsx
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

type IconVariant = "primary" | "success" | "error" | "info" | "warning";

interface IconBoxProps {
  name: React.ComponentProps<typeof Ionicons>["name"];
  variant?: IconVariant;
  size?: number;
}

export function IconBox({
  name,
  variant = "primary",
  size = 20,
}: IconBoxProps) {
  const { colors, radius } = useTheme();

  const variantMap: Record<IconVariant, { bg: string; fg: string }> = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    error: { bg: colors.errorSoft, fg: colors.error },
    info: { bg: colors.infoSoft, fg: colors.info },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  };

  const { bg, fg } = variantMap[variant];

  return (
    <View
      style={{
        height: 40,
        width: 40,
        borderRadius: radius.lg,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size} color={fg} />
    </View>
  );
}
