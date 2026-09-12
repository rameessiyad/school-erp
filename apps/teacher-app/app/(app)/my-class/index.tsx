import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useMyClassStudents } from "../../../src/hooks/useStudentAttendance";
import { todayISODate } from "../../../src/lib/date";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { StatCard } from "../../../src/components/dashboard/StatCard";

export default function MyClassScreen() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const todayDate = todayISODate();
  const { data, isLoading } = useMyClassStudents(todayDate);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter((s) =>
      `${s.firstName} ${s.lastName ?? ""}`.toLowerCase().includes(q),
    );
  }, [data, search]);

  if (isLoading || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ padding: spacing[5], color: colors.textMuted }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
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
        <View>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 18,
              color: colors.textPrimary,
            }}
          >
            {data.section.className} - {data.section.name}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            My Class
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing[5] }}>
        {/* Total students card */}
        <View style={{ flexDirection: "row", marginBottom: spacing[4] }}>
          <StatCard
            label="Total Students"
            value={data.students.length}
            variant="primary"
          />
        </View>

        {/* Search field */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing[3],
            marginBottom: spacing[4],
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

        <View style={{ flexDirection: "row", gap: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <Button
              label={data.isMarked ? "Edit Attendance" : "Take Attendance"}
              onPress={() =>
                router.push({
                  pathname: "/(app)/my-class/attendance",
                  params: { date: todayDate },
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="View Attendance"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/(app)/my-class/view-attendance",
                  params: { date: todayDate },
                })
              }
            />
          </View>
        </View>
      </View>

      {/* Student list */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[4],
          paddingBottom: spacing[10],
          gap: spacing[2],
        }}
        renderItem={({ item }) => (
          <Card
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[3],
            }}
          >
            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
                style={{ width: 40, height: 40, borderRadius: radius.full }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.full,
                  backgroundColor: colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.semibold,
                    color: colors.primary,
                  }}
                >
                  {item.firstName[0]}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
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
          </Card>
        )}
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
      />
    </SafeAreaView>
  );
}
