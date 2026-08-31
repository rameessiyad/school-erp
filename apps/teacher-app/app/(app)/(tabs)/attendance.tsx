import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/theme/ThemeProvider";
import {
  useAttendanceForDate,
  useMarkAttendance,
  AttendanceStatus,
  AttendanceStudent,
} from "../../../src/hooks/useMyClass";
import { Button } from "../../../src/components/ui/Button";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  color: (c: any) => string;
}[] = [
  { value: "PRESENT", label: "P", color: (c) => c.success },
  { value: "ABSENT", label: "A", color: (c) => c.error },
  { value: "LATE", label: "L", color: (c) => c.warning },
];

function StudentRow({
  item,
  status,
  onChange,
}: {
  item: AttendanceStudent["student"];
  status: AttendanceStatus | null;
  onChange: (s: AttendanceStatus) => void;
}) {
  const { colors, spacing, fontFamily } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: 14,
            color: colors.textPrimary,
          }}
        >
          {item.firstName} {item.lastName}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          Roll No: {item.rollNo}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing[2] }}>
        {STATUS_OPTIONS.map((opt) => {
          const active = status === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? opt.color(colors) : colors.surface,
                borderWidth: 1,
                borderColor: active ? opt.color(colors) : colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamily.semibold,
                  fontSize: 13,
                  color: active ? "#fff" : colors.textMuted,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AttendanceScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const [date] = useState(todayISO());
  const { data, isLoading, isError } = useAttendanceForDate(date);
  const markAttendance = useMarkAttendance();

  const [localStatus, setLocalStatus] = useState<
    Record<string, AttendanceStatus>
  >({});

  const rows = useMemo(() => {
    if (!data) return [];
    return data.map((row) => ({
      ...row,
      status: localStatus[row.student.id] ?? row.status,
    }));
  }, [data, localStatus]);

  const allMarked = rows.length > 0 && rows.every((r) => r.status !== null);

  const handleChange = (studentId: string, status: AttendanceStatus) => {
    setLocalStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const entries = rows
      .filter((r) => r.status !== null)
      .map((r) => ({
        studentId: r.student.id,
        status: r.status as AttendanceStatus,
      }));

    markAttendance.mutate(
      { date, entries },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Attendance has been recorded.");
          setLocalStatus({});
        },
        onError: () => {
          Alert.alert("Error", "Could not save attendance. Try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: colors.error }}>Failed to load attendance.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[4],
          paddingBottom: spacing[3],
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          Mark Attendance
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 13,
            color: colors.textMuted,
            marginTop: 2,
          }}
        >
          {date}
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.student.id}
        renderItem={({ item }) => (
          <StudentRow
            item={item.student}
            status={item.status}
            onChange={(s) => handleChange(item.student.id, s)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing[5],
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          label={markAttendance.isPending ? "Saving..." : "Save Attendance"}
          onPress={handleSave}
          disabled={markAttendance.isPending || rows.length === 0}
        />
        {!allMarked && rows.length > 0 && (
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 11,
              color: colors.textMuted,
              textAlign: "center",
              marginTop: spacing[2],
            }}
          >
            {rows.filter((r) => r.status === null).length} student(s) not marked
            yet
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
