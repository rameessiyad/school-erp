// app/(app)/(tabs)/home.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/store/auth.store";
import { useMyLeaveApplications } from "../../../src/hooks/useTeacherLeave";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { TopBar } from "../../../src/components/dashboard/TopBar";
import { AttendanceCard } from "../../../src/components/dashboard/AttendanceCard";
import { SectionHeader } from "../../../src/components/dashboard/SectionHeader";
import { StatCard } from "../../../src/components/dashboard/StatCard";
import { ClassSubjectRow } from "../../../src/components/dashboard/ClassSubjectRow";
import { QuickAction } from "../../../src/components/dashboard/QuickAction";
import { mockClassSubjects } from "../../../src/data/mockDashboard";

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  const { data: leaveApplications } = useMyLeaveApplications();

  // TODO: swap for real teacher profile (firstName) once a /teachers/me
  // endpoint exists. For now we derive a readable name from the login email.
  const displayName = user?.email ? user.email.split("@")[0] : "Teacher";

  // Real data — computed from the actual leave applications response
  const leaveSummary = {
    pending:
      leaveApplications?.filter((l) => l.status === "PENDING").length ?? 0,
    approved:
      leaveApplications?.filter((l) => l.status === "APPROVED").length ?? 0,
    rejected:
      leaveApplications?.filter((l) => l.status === "REJECTED").length ?? 0,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing[6],
          paddingBottom: spacing[12],
        }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar displayName={displayName} />

        <AttendanceCard />

        {/* My Classes & Subjects — TODO: mock data, swap once classes/subjects backend is shared */}
        <Card style={{ marginBottom: spacing[5] }}>
          <SectionHeader
            icon="book-outline"
            title="My classes & subjects"
            subtitle="What you're teaching this year"
          />
          <View style={{ gap: spacing[2] }}>
            {mockClassSubjects.map((item) => (
              <ClassSubjectRow key={item.id} item={item} />
            ))}
          </View>
        </Card>

        {/* Leave — real data from useMyLeaveApplications */}
        <Card style={{ marginBottom: spacing[5] }}>
          <SectionHeader
            icon="calendar-outline"
            title="Leave applications"
            subtitle="Your request status"
            variant="info"
          />

          <View
            style={{
              flexDirection: "row",
              gap: spacing[3],
              marginBottom: spacing[5],
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

        {/* Homework & Assignments — stub screens, backend not built yet */}
        <Card>
          <SectionHeader
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
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
