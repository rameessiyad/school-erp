// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useAuthStore } from "../../src/store/auth.store";
import { authApi } from "../../src/api/auth.api";
import { getErrorMessage } from "../../src/api/error";
import { loginSchema, LoginFormValues } from "../../src/lib/validations/auth";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { secureStorage } from "../../src/lib/secureStorage";

export default function LoginScreen() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const setSession = useAuthStore((s) => s.setSession);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { schoolId: "", email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      authApi.login(values.schoolId, values.email, values.password),
    onSuccess: async (data, variables) => {
      await setSession(data);
      await secureStorage.setLastSchoolId(variables.schoolId);
      router.replace("/(app)/(tabs)/home");
    },
    onError: (error) => {
      setServerError(getErrorMessage(error, "Login failed"));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    loginMutation.mutate(values);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: spacing[6],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View
          style={{
            alignItems: "center",
            marginBottom: spacing[8],
            gap: spacing[3],
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: radius.xl,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="school-outline"
              size={20}
              color={colors.primaryForeground}
            />
          </View>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 18,
              color: colors.textPrimary,
            }}
          >
            School ERP
          </Text>
        </View>

        <Card>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 24,
              color: colors.textPrimary,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: spacing[2],
              marginBottom: spacing[6],
            }}
          >
            Sign in to continue to your teacher dashboard.
          </Text>

          <View style={{ gap: spacing[5] }}>
            <Controller
              control={control}
              name="schoolId"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="School ID"
                  placeholder="e.g. school_abc123"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.schoolId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email address"
                  placeholder="teacher@school.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            {serverError && (
              <View
                style={{
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  borderColor: colors.errorSoft,
                  backgroundColor: colors.errorSoft,
                  paddingVertical: spacing[3],
                  paddingHorizontal: spacing[3] + 2,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontFamily: fontFamily.medium,
                    color: colors.error,
                  }}
                >
                  {serverError}
                </Text>
              </View>
            )}

            <Button
              label={loginMutation.isPending ? "Signing in..." : "Sign in"}
              loading={loginMutation.isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: spacing[2],
              marginTop: spacing[6],
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: fontFamily.regular,
              }}
            >
              Secure access for authorized teachers
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
