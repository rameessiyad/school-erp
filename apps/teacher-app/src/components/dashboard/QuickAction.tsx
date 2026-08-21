// src/components/dashboard/QuickAction.tsx
import React from "react";
import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

interface QuickActionProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}

export function QuickAction({ icon, label, onPress }: QuickActionProps) {
  const { colors, radius, spacing, fontFamily, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexBasis: "47%",
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing[4],
        alignItems: "center",
        gap: spacing[2],
        opacity: pressed ? 0.85 : 1,
        ...shadows.sm,
      })}
    >
      <View
        style={{
          height: 40,
          width: 40,
          borderRadius: radius.lg,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text
        style={{
          fontFamily: fontFamily.medium,
          fontSize: 12,
          color: colors.textPrimary,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
