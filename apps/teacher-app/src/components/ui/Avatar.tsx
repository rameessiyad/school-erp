// src/components/ui/Avatar.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface AvatarProps {
  name: string;
  size?: number;
  onPress?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 40, onPress }: AvatarProps) {
  const { colors, fontFamily } = useTheme();

  const content = (
    <View
      style={{
        height: size,
        width: size,
        borderRadius: size / 2,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.semibold,
          fontSize: size * 0.4,
          color: colors.primary,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {content}
    </Pressable>
  );
}
