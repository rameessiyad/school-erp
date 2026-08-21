import React from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useApplyLeave } from "../../../src/hooks/useTeacherLeave";
import {
  applyLeaveSchema,
  ApplyLeaveFormValues,
} from "../../../src/lib/validations/leave";
import { getErrorMessage } from "../../../src/api/error";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { DatePickerField } from "../../../src/components/ui/DatePickerField";

export default function ApplyLeaveScreen() {
  const { colors, spacing, fontFamily, radius } = useTheme();
  const applyLeave = useApplyLeave();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
  });

  const onSubmit = (values: ApplyLeaveFormValues) => {
    applyLeave.mutate(
      {
        fromDate: values.fromDate.toISOString(),
        toDate: values.toDate.toISOString(),
        reason: values.reason,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          padding: spacing[6],
          paddingBottom: 0,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          Apply for leave
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[6] }}>
        <Card>
          <View style={{ gap: spacing[5] }}>
            <Controller
              control={control}
              name="fromDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="From date"
                  value={value ?? null}
                  onChange={onChange}
                  error={errors.fromDate?.message}
                  minimumDate={new Date()}
                />
              )}
            />

            <Controller
              control={control}
              name="toDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="To date"
                  value={value ?? null}
                  onChange={onChange}
                  error={errors.toDate?.message}
                  minimumDate={new Date()}
                />
              )}
            />

            <Controller
              control={control}
              name="reason"
              render={({ field: { onChange, value } }) => (
                <View style={{ gap: spacing[2] }}>
                  <Text
                    style={{
                      fontFamily: fontFamily.medium,
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Reason
                  </Text>
                  <View
                    style={{
                      borderRadius: radius.xl,
                      borderWidth: 1,
                      borderColor: errors.reason ? colors.error : colors.border,
                      backgroundColor: colors.surfaceSecondary,
                      padding: spacing[3],
                    }}
                  >
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={4}
                      placeholder="Reason for leave"
                      placeholderTextColor={colors.textMuted}
                      style={{
                        fontFamily: fontFamily.regular,
                        fontSize: 14,
                        color: colors.textPrimary,
                        textAlignVertical: "top",
                        minHeight: 80,
                      }}
                    />
                  </View>
                  {errors.reason && (
                    <Text style={{ fontSize: 12, color: colors.error }}>
                      {errors.reason.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {applyLeave.isError && (
              <View
                style={{
                  backgroundColor: colors.errorSoft,
                  borderRadius: radius.xl,
                  padding: spacing[3],
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: colors.error,
                    fontFamily: fontFamily.medium,
                  }}
                >
                  {getErrorMessage(
                    applyLeave.error,
                    "Could not submit leave application",
                  )}
                </Text>
              </View>
            )}

            <Button
              label={
                applyLeave.isPending ? "Submitting..." : "Submit application"
              }
              loading={applyLeave.isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
