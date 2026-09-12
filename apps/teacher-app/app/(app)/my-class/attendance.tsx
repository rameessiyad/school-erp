import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import {
  useMyClassStudents,
  useMarkStudentAttendance,
} from "../../../src/hooks/useStudentAttendance";
import { StudentAttendanceStatus } from "../../../src/types/studentAttendance";
import { Button } from "../../../src/components/ui/Button";

export default function TakeAttendanceScreen() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data } = useMyClassStudents(date); // cached from the my-class screen, no refetch
  const markAttendance = useMarkStudentAttendance();

  // studentId -> status, defaults to PRESENT (or existing marked status) for everyone
  const [statusMap, setStatusMap] = useState<
    Record<string, StudentAttendanceStatus>
  >(() =>
    Object.fromEntries(
      (data?.students ?? []).map((s) => [s.studentId, s.status]),
    ),
  );

  const presentCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === "PRESENT").length,
    [statusMap],
  );

  function toggle(studentId: string) {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  }

  function handleSubmit() {
    if (!data) return;
    markAttendance.mutate(
      {
        sectionId: data.section.id,
        date,
        records: Object.entries(statusMap).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }

  const isEditing = data?.isMarked ?? false;

  if (!data) return null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing[5],
          paddingTop: spacing[3],
          paddingBottom: spacing[4],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
          }}
        >
          <Ionicons
            name="close"
            size={24}
            color={colors.textPrimary}
            onPress={() => router.back()}
          />
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 16,
              color: colors.textPrimary,
            }}
          >
            {isEditing ? "Edit Attendance" : "Take Attendance"}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          {presentCount}/{data.students.length} present
        </Text>
      </View>

      <FlatList
        data={data.students}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          gap: spacing[2],
          paddingBottom: spacing[10],
        }}
        renderItem={({ item }) => {
          const isPresent = statusMap[item.studentId] === "PRESENT";
          return (
            <TouchableOpacity
              onPress={() => toggle(item.studentId)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: isPresent ? colors.border : colors.error,
                paddingVertical: spacing[3],
                paddingHorizontal: spacing[4],
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: fontFamily.medium,
                    fontSize: 14,
                    color: colors.textPrimary,
                  }}
                >
                  {item.firstName} {item.lastName ?? ""}
                </Text>
                {item.rollNo && (
                  <Text
                    style={{
                      fontFamily: fontFamily.regular,
                      fontSize: 12,
                      color: colors.textMuted,
                    }}
                  >
                    Roll No: {item.rollNo}
                  </Text>
                )}
              </View>
              <Ionicons
                name={isPresent ? "checkmark-circle" : "close-circle"}
                size={26}
                color={isPresent ? colors.success : colors.error}
              />
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ padding: spacing[5] }}>
        <Button
          label={
            markAttendance.isPending
              ? "Submitting..."
              : isEditing
                ? "Update Attendance"
                : "Submit Attendance"
          }
          onPress={handleSubmit}
          disabled={markAttendance.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
