import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { IconBox } from "../ui/IconBox";

interface SectionHeaderProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  variant?: "primary" | "success" | "error" | "info" | "warning";
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  variant = "primary",
}: SectionHeaderProps) {
  const { colors, spacing, fontFamily } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        marginBottom: spacing[4],
      }}
    >
      <IconBox name={icon} variant={variant} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 15,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 12,
              color: colors.textMuted,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
