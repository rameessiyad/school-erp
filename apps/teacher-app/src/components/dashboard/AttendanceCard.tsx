import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { formatFullDate, formatTime } from "../../lib/date";
import {
  useTodayAttendance,
  useMarkAttendance,
} from "../../hooks/useTeacherAttendance";
import { TeacherAttendanceStatus } from "../../types/attendance";
import { Card } from "../ui/Card";
import { SectionHeader } from "./SectionHeader";

const STATUS_CONFIG: Record<
  TeacherAttendanceStatus,
  { label: string; colorKey: "success" | "error" | "warning" | "info" }
> = {
  PRESENT: { label: "Present", colorKey: "success" },
  ABSENT: { label: "Absent", colorKey: "error" },
  HALF_DAY: { label: "Half day", colorKey: "warning" },
  ON_LEAVE: { label: "On leave", colorKey: "info" },
};

function MarkButton({
  label,
  colorKey,
  onPress,
  disabled,
}: {
  label: string;
  colorKey: "success" | "error" | "warning";
  onPress: () => void;
  disabled: boolean;
}) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const mainColor = {
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
  }[colorKey];
  const softColor = {
    success: colors.successSoft,
    error: colors.errorSoft,
    warning: colors.warningSoft,
  }[colorKey];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: softColor,
        borderRadius: radius.lg,
        paddingVertical: spacing[3],
        alignItems: "center",
        opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: fontFamily.medium,
          fontSize: 13,
          color: mainColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AttendanceCard() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const { data: todayRecord, isLoading } = useTodayAttendance();
  const markAttendance = useMarkAttendance();

  const status = todayRecord?.status as TeacherAttendanceStatus | undefined;

  return (
    <Card style={{ marginBottom: spacing[5] }}>
      <SectionHeader
        icon="finger-print-outline"
        title="Today's attendance"
        subtitle={formatFullDate()}
        variant={status ? STATUS_CONFIG[status].colorKey : "primary"}
      />

      {isLoading ? (
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          Checking today's status...
        </Text>
      ) : status ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.lg,
            padding: spacing[4],
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={
              {
                success: colors.success,
                error: colors.error,
                warning: colors.warning,
                info: colors.info,
              }[STATUS_CONFIG[status].colorKey]
            }
          />
          <View>
            <Text
              style={{
                fontFamily: fontFamily.medium,
                fontSize: 14,
                color: colors.textPrimary,
              }}
            >
              Marked as {STATUS_CONFIG[status].label}
            </Text>
            {todayRecord?.markedAt && (
              <Text
                style={{
                  fontFamily: fontFamily.regular,
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                at {formatTime(new Date(todayRecord.markedAt))}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View>
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: spacing[3],
            }}
          >
            You haven't marked your attendance yet.
          </Text>
          <View style={{ flexDirection: "row", gap: spacing[3] }}>
            <MarkButton
              label="Present"
              colorKey="success"
              disabled={markAttendance.isPending}
              onPress={() => markAttendance.mutate("PRESENT")}
            />
            <MarkButton
              label="Half day"
              colorKey="warning"
              disabled={markAttendance.isPending}
              onPress={() => markAttendance.mutate("HALF_DAY")}
            />
            <MarkButton
              label="Absent"
              colorKey="error"
              disabled={markAttendance.isPending}
              onPress={() => markAttendance.mutate("ABSENT")}
            />
          </View>
          {markAttendance.isError && (
            <Text
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 12,
                color: colors.error,
                marginTop: spacing[2],
              }}
            >
              Couldn't mark attendance. Try again.
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}
