// src/components/dashboard/TopBar.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import { Avatar } from "../ui/Avatar";

interface TopBarProps {
  displayName: string;
}

export function TopBar({ displayName }: TopBarProps) {
  const { colors, spacing, fontFamily, scheme, setOverride } = useTheme();

  const toggleTheme = () => setOverride(scheme === "dark" ? "light" : "dark");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing[6],
      }}
    >
      <View>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          Welcome back
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 18,
            color: colors.textPrimary,
            marginTop: 2,
          }}
        >
          {displayName}
        </Text>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}
      >
        <Pressable
          onPress={toggleTheme}
          hitSlop={8}
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={scheme === "dark" ? "moon-outline" : "sunny-outline"}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={() => {}}
          hitSlop={8}
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={colors.textSecondary}
          />
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              height: 7,
              width: 7,
              borderRadius: 4,
              backgroundColor: colors.error,
            }}
          />
        </Pressable>

        <Avatar
          name={displayName}
          onPress={() => router.push("/(app)/(tabs)/profile")}
        />
      </View>
    </View>
  );
}
