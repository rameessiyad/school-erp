// app/(app)/(tabs)/home.tsx
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/store/auth.store";
import { useMyLeaveApplications } from "../../../src/hooks/useTeacherLeave";
import { useTeacherProfile } from "../../../src/hooks/useTeacherProfile";
import { useMyClassStudents } from "../../../src/hooks/useStudentAttendance";
import { todayISODate } from "../../../src/lib/date";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { TopBar } from "../../../src/components/dashboard/TopBar";
import { AttendanceCard } from "../../../src/components/dashboard/AttendanceCard";
import { StatCard } from "../../../src/components/dashboard/StatCard";
import { ClassSubjectRow } from "../../../src/components/dashboard/ClassSubjectRow";
import { QuickAction } from "../../../src/components/dashboard/QuickAction";
import { IconBox } from "../../../src/components/ui/IconBox";
import { fontFamily } from "../../../src/theme/tokens";
import {
  ClassSubjectRowSkeleton,
  MyClassCardSkeleton,
} from "../../../src/components/ui/SkeletonBlock";

function PlainSectionHeader({
  icon,
  title,
  subtitle,
  variant = "primary",
}: {
  icon: React.ComponentProps<typeof IconBox>["name"];
  title: string;
  subtitle?: string;
  variant?: "primary" | "success" | "error" | "info" | "warning";
}) {
  const { colors, spacing, fontFamily } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        marginBottom: spacing[3],
      }}
    >
      <IconBox name={icon} variant={variant} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 15,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 12,
              color: colors.textMuted,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [showAllClasses, setShowAllClasses] = useState(false);

  const CLASSES_PREVIEW_COUNT = 4;
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  const { data: leaveApplications } = useMyLeaveApplications();
  const { data: profile, isLoading: isProfileLoading } = useTeacherProfile();
  const todayDate = todayISODate();
  const { data: myClass, isLoading: isMyClassLoading } =
    useMyClassStudents(todayDate);

  const displayName =
    profile?.firstName ?? (user?.email ? user.email.split("@")[0] : "Teacher");

  const leaveSummary = {
    pending:
      leaveApplications?.filter((l) => l.status === "PENDING").length ?? 0,
    approved:
      leaveApplications?.filter((l) => l.status === "APPROVED").length ?? 0,
    rejected:
      leaveApplications?.filter((l) => l.status === "REJECTED").length ?? 0,
  };

  const allAllocations = profile?.teacherSubjectAllocations ?? [];
  const visibleAllocations = showAllClasses
    ? allAllocations
    : allAllocations.slice(0, CLASSES_PREVIEW_COUNT);
  const hasMoreClasses = allAllocations.length > CLASSES_PREVIEW_COUNT;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[5],
          paddingBottom: spacing[12],
        }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar displayName={displayName} />

        <AttendanceCard />

        {/* My Class — only shown if this teacher is a class teacher for some section */}
        {isMyClassLoading ? (
          <MyClassCardSkeleton />
        ) : (
          myClass && (
            <Card style={{ marginBottom: spacing[6] }}>
              <PlainSectionHeader
                icon="people-outline"
                title="My Class"
                subtitle={`${myClass.section.className} - ${myClass.section.name} - ${myClass.students.length} students`}
                variant="primary"
              />
              <Button
                label="View My Class"
                onPress={() => router.push("/(app)/my-class")}
              />
            </Card>
          )
        )}
        {/* Classes & Subjects — plain section, no outer Card box */}
        <View style={{ marginBottom: spacing[6] }}>
          <PlainSectionHeader
            icon="book-outline"
            title="My classes & subjects"
            subtitle="What you're teaching this year"
          />
          <View style={{ gap: spacing[2] }}>
            {isProfileLoading ? (
              <>
                <ClassSubjectRowSkeleton />
                <ClassSubjectRowSkeleton />
                <ClassSubjectRowSkeleton />
              </>
            ) : (
              visibleAllocations.map((item) => (
                <ClassSubjectRow
                  key={item.id}
                  item={{
                    id: item.id,
                    subjectName: item.subject.name,
                    className: item.section.class.name,
                    sectionName: item.section.name,
                    isClassTeacher: false,
                  }}
                  onPress={() => router.push(`/(app)/subject-class/${item.id}`)}
                />
              ))
            )}
          </View>

          {!isProfileLoading && hasMoreClasses && (
            <Text
              onPress={() => setShowAllClasses((prev) => !prev)}
              style={{
                fontFamily: fontFamily.medium,
                fontSize: 13,
                color: colors.primary,
                textAlign: "center",
                marginTop: spacing[3],
              }}
            >
              {showAllClasses
                ? "Show less"
                : `View more (${allAllocations.length - CLASSES_PREVIEW_COUNT} more)`}
            </Text>
          )}
        </View>

        {/* Leave — kept as Card since it has actionable buttons + stats */}
        <Card style={{ marginBottom: spacing[6] }}>
          <PlainSectionHeader
            icon="calendar-outline"
            title="Leave applications"
            subtitle="Your request status"
            variant="info"
          />

          <View
            style={{
              flexDirection: "row",
              gap: spacing[3],
              marginBottom: spacing[4],
            }}
          >
            <StatCard
              label="Pending"
              value={leaveSummary.pending}
              variant="warning"
            />
            <StatCard
              label="Approved"
              value={leaveSummary.approved}
              variant="success"
            />
            <StatCard
              label="Rejected"
              value={leaveSummary.rejected}
              variant="error"
            />
          </View>

          <View style={{ flexDirection: "row", gap: spacing[3] }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Apply for leave"
                onPress={() => router.push("/(app)/leave/apply")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="View history"
                variant="secondary"
                onPress={() => router.push("/(app)/(tabs)/leave")}
              />
            </View>
          </View>
        </Card>

        {/* Homework & Assignments — plain section, QuickAction cards carry their own elevation */}
        <View>
          <PlainSectionHeader
            icon="clipboard-outline"
            title="Homework & assignments"
            subtitle="Post work and track submissions"
            variant="success"
          />
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}
          >
            <QuickAction
              icon="add-circle-outline"
              label="Post homework"
              onPress={() => router.push("/(app)/homework/post")}
            />
            <QuickAction
              icon="stats-chart-outline"
              label="Homework status"
              onPress={() => router.push("/(app)/homework/status")}
            />
            <QuickAction
              icon="add-circle-outline"
              label="Post assignment"
              onPress={() => router.push("/(app)/assignment/post")}
            />
            <QuickAction
              icon="stats-chart-outline"
              label="Assignment status"
              onPress={() => router.push("/(app)/assignment/status")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
