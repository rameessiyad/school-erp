// src/components/ui/Input.tsx
import React, { forwardRef, useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, isPassword, style, ...props }, ref) => {
    const { colors, radius, spacing, fontFamily } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    return (
      <View style={{ gap: spacing[2] }}>
        {label && (
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {label}
          </Text>
        )}

        <View style={{ position: "relative" }}>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isPassword && !showPassword}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            style={[
              {
                height: spacing[11],
                paddingHorizontal: spacing[3] + 2,
                paddingRight: isPassword ? spacing[11] : spacing[3] + 2,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: focused ? colors.primary : colors.border,
                backgroundColor: focused
                  ? colors.surface
                  : colors.surfaceSecondary,
                color: colors.textPrimary,
                fontFamily: fontFamily.regular,
                fontSize: 14,
              },
              style,
            ]}
            {...props}
          />

          {isPassword && (
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: spacing[11],
                width: spacing[11],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        {error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.error,
              fontFamily: fontFamily.regular,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
