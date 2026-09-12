import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useMyClassStudents } from "../../../src/hooks/useStudentAttendance";
import { formatFullDate, todayISODate } from "../../../src/lib/date";
import { StatCard } from "../../../src/components/dashboard/StatCard";

const STATUS_META: Record<
  string,
  { label: string; color: "success" | "error" | "warning" }
> = {
  PRESENT: { label: "Present", color: "success" },
  ABSENT: { label: "Absent", color: "error" },
  HALF_DAY: { label: "Half Day", color: "warning" },
  LATE: { label: "Late", color: "warning" },
};

// "2026-09-12" -> Date, and back, in local time (avoids UTC off-by-one issues)
function isoToDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function dateToISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ViewAttendanceScreen() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const params = useLocalSearchParams<{ date: string }>();
  const [selectedDate, setSelectedDate] = useState(
    params.date ?? todayISODate(),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useMyClassStudents(selectedDate);

  const isToday = selectedDate === todayISODate();

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter((s) =>
      `${s.firstName} ${s.lastName ?? ""}`.toLowerCase().includes(q),
    );
  }, [data, search]);

  function handlePickerChange(event: any, date?: Date) {
    // Android closes the picker after one selection automatically; iOS stays open (spinner/inline)
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !date) return;
    setSelectedDate(dateToISO(date));
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          paddingHorizontal: spacing[5],
          paddingTop: spacing[3],
          paddingBottom: spacing[4],
        }}
      >
        <Ionicons
          name="chevron-back"
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
          View Attendance
        </Text>
      </View>

      {/* Date selector — tap to open calendar */}
      <View style={{ paddingHorizontal: spacing[5], marginBottom: spacing[4] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[2],
            }}
            onTouchEnd={() => setShowPicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.primary}
            />
            <Text
              style={{
                fontFamily: fontFamily.medium,
                fontSize: 14,
                color: colors.textPrimary,
              }}
            >
              {formatFullDate(isoToDate(selectedDate))}
            </Text>
            {isToday && (
              <Text
                style={{
                  fontFamily: fontFamily.regular,
                  fontSize: 11,
                  color: colors.textMuted,
                }}
              >
                (Today)
              </Text>
            )}
          </View>

          {!isToday && (
            <Text
              style={{
                fontFamily: fontFamily.medium,
                fontSize: 12,
                color: colors.primary,
              }}
              onPress={() => setSelectedDate(todayISODate())}
            >
              Today
            </Text>
          )}
        </View>

        {showPicker && (
          <DateTimePicker
            value={isoToDate(selectedDate)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            maximumDate={new Date()}
            onChange={handlePickerChange}
          />
        )}
      </View>

      {/* Search field */}
      <View style={{ paddingHorizontal: spacing[5], marginBottom: spacing[4] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing[3],
          }}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search student by name"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              paddingVertical: spacing[3],
              paddingHorizontal: spacing[2],
              fontFamily: fontFamily.regular,
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />
        </View>
      </View>

      {isLoading || !data ? (
        <Text
          style={{
            textAlign: "center",
            color: colors.textMuted,
            marginTop: spacing[6],
          }}
        >
          Loading...
        </Text>
      ) : !data.isMarked ? (
        <View
          style={{
            alignItems: "center",
            marginTop: spacing[10],
            paddingHorizontal: spacing[5],
          }}
        >
          <Ionicons
            name="calendar-clear-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 14,
              color: colors.textMuted,
              marginTop: spacing[3],
              textAlign: "center",
            }}
          >
            Attendance was not taken on this date
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{ paddingHorizontal: spacing[5], marginBottom: spacing[4] }}
          >
            <View style={{ flexDirection: "row", gap: spacing[3] }}>
              <StatCard
                label="Present"
                value={
                  data.students.filter((s) => s.status === "PRESENT").length
                }
                variant="success"
              />
              <StatCard
                label="Absent"
                value={
                  data.students.filter((s) => s.status === "ABSENT").length
                }
                variant="error"
              />
            </View>
          </View>

          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.studentId}
            contentContainerStyle={{
              paddingHorizontal: spacing[5],
              gap: spacing[2],
              paddingBottom: spacing[10],
            }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: colors.textMuted,
                  marginTop: spacing[6],
                }}
              >
                No students found
              </Text>
            }
            renderItem={({ item }) => {
              const meta = STATUS_META[item.status];
              const statusColor = meta ? colors[meta.color] : colors.textMuted;
              const statusSoft = meta
                ? colors[`${meta.color}Soft` as keyof typeof colors]
                : colors.muted;
              return (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: colors.surface,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
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
                  <View
                    style={{
                      backgroundColor: statusSoft,
                      borderRadius: radius.full,
                      paddingHorizontal: spacing[3],
                      paddingVertical: spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.medium,
                        fontSize: 12,
                        color: statusColor,
                      }}
                    >
                      {meta?.label ?? item.status}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}
