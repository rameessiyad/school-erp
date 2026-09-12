import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useSubjectClass } from "../../../src/hooks/useSubjectClass";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { StatCard } from "../../../src/components/dashboard/StatCard";
import { Skeleton } from "../../../src/components/ui/Skeleton";

function SubjectClassSkeleton() {
  const { spacing, radius } = useTheme();
  return (
    <View style={{ flex: 1, paddingTop: spacing[3] }}>
      {/* Header skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          paddingHorizontal: spacing[5],
          paddingBottom: spacing[4],
        }}
      >
        <Skeleton width={24} height={24} borderRadius={12} />
        <View style={{ gap: 6 }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={100} height={13} />
          <Skeleton width={140} height={22} borderRadius={radius.full} />
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing[5] }}>
        <Skeleton
          height={72}
          borderRadius={radius.xl}
          style={{ marginBottom: spacing[4] }}
        />
        <Skeleton
          height={72}
          borderRadius={radius.lg}
          style={{ marginBottom: spacing[4] }}
        />
        <Skeleton
          height={44}
          borderRadius={radius.md}
          style={{ marginBottom: spacing[4] }}
        />
        <View
          style={{
            flexDirection: "row",
            gap: spacing[3],
            marginBottom: spacing[4],
          }}
        >
          <Skeleton height={44} borderRadius={radius.md} style={{ flex: 1 }} />
          <Skeleton height={44} borderRadius={radius.md} style={{ flex: 1 }} />
        </View>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            height={64}
            borderRadius={radius.lg}
            style={{ marginBottom: spacing[2] }}
          />
        ))}
      </View>
    </View>
  );
}

export default function SubjectClassScreen() {
  const { colors, spacing, radius, fontFamily } = useTheme();
  const { allocationId } = useLocalSearchParams<{ allocationId: string }>();
  const { data, isLoading } = useSubjectClass(allocationId);
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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <SubjectClassSkeleton />
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
          alignItems: "flex-start",
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
          style={{ marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
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
              marginTop: 2,
              marginBottom: spacing[2],
            }}
          >
            {data.subject.name}
          </Text>

          {/* Class teacher chip — more visible now */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 6,
              backgroundColor: colors.secondarySoft,
              paddingVertical: 6,
              paddingHorizontal: spacing[3],
              borderRadius: radius.full,
            }}
          >
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colors.secondary}
            />
            <Text
              style={{
                fontFamily: fontFamily.semibold,
                fontSize: 13,
                color: colors.secondary,
              }}
            >
              Class Teacher: {data.section.classTeacherName ?? "Not assigned"}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing[5] }}>
        {/* Stat cards */}
        <View
          style={{
            flexDirection: "row",
            gap: spacing[3],
            marginBottom: spacing[4],
          }}
        >
          <StatCard
            label="Total Students"
            value={data.students.length}
            variant="primary"
          />
        </View>

        {/* Subject card */}
        <Card
          style={{
            marginBottom: spacing[4],
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.lg,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="book-outline" size={22} color={colors.primary} />
          </View>
          <View>
            <Text
              style={{
                fontFamily: fontFamily.semibold,
                fontSize: 15,
                color: colors.textPrimary,
              }}
            >
              {data.subject.name}
            </Text>
            <Text
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {data.section.className} · Section {data.section.name}
            </Text>
          </View>
        </Card>

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

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: spacing[3],
            marginBottom: spacing[4],
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              label="Assign Homework"
              onPress={() =>
                router.push({
                  pathname: "/(app)/homework/post",
                  params: { allocationId: data.allocationId },
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Assign Assignment"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/(app)/assignment/post",
                  params: { allocationId: data.allocationId },
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
          paddingBottom: spacing[10],
          gap: spacing[2],
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
      />
    </SafeAreaView>
  );
}
