import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/store/auth.store";
import { useTeacherProfile } from "../../../src/hooks/useTeacherProfile";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Avatar } from "../../../src/components/ui/Avatar";
import { TeacherSubjectAllocation } from "../../../src/types/teacher";

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string | null;
}) {
  const { colors, spacing, fontFamily } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        paddingVertical: spacing[3],
      }}
    >
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: 14,
            color: colors.textPrimary,
            marginTop: 2,
          }}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

function AllocationRow({ item }: { item: TeacherSubjectAllocation }) {
  const { colors, radius, spacing, fontFamily } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[3] + 2,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radius.lg,
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
          {item.subject.name}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {item.section.class.name} · Section {item.section.name}
        </Text>
      </View>

      {item.academicYear.isActive && (
        <View
          style={{
            backgroundColor: colors.primarySoft,
            paddingHorizontal: spacing[2] + 2,
            paddingVertical: 4,
            borderRadius: radius.full,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 10,
              color: colors.primary,
            }}
          >
            {item.academicYear.label}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const { logout } = useAuthStore();
  const { data: profile, isLoading, isError, refetch } = useTeacherProfile();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ color: colors.textMuted, fontFamily: fontFamily.regular }}
        >
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing[6],
        }}
      >
        <Text
          style={{
            color: colors.error,
            fontFamily: fontFamily.medium,
            textAlign: "center",
            marginBottom: spacing[4],
          }}
        >
          Couldn't load your profile.
        </Text>
        <Button
          label="Try again"
          variant="secondary"
          onPress={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName ?? ""}`.trim();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing[5],
          paddingBottom: spacing[12],
        }}
      >
        <View style={{ alignItems: "center", marginBottom: spacing[6] }}>
          <Avatar name={fullName} size={72} />
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 18,
              color: colors.textPrimary,
              marginTop: spacing[3],
            }}
          >
            {fullName}
          </Text>
          {profile.employeeId && (
            <Text
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 13,
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              {profile.employeeId}
            </Text>
          )}
        </View>

        <Card style={{ marginBottom: spacing[5] }}>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: spacing[1],
            }}
          >
            Contact
          </Text>
          <DetailRow icon="mail-outline" label="Email" value={profile.email} />
          <DetailRow icon="call-outline" label="Phone" value={profile.phone} />
        </Card>

        <Card style={{ marginBottom: spacing[5] }}>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: spacing[1],
            }}
          >
            Professional details
          </Text>
          <DetailRow
            icon="school-outline"
            label="Qualification"
            value={profile.qualification}
          />
          <DetailRow
            icon="time-outline"
            label="Experience"
            value={
              profile.experience != null ? `${profile.experience} years` : null
            }
          />
          <DetailRow
            icon="calendar-outline"
            label="Joining date"
            value={
              profile.joiningDate
                ? new Date(profile.joiningDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
          />
          <DetailRow
            icon="person-outline"
            label="Gender"
            value={profile.gender}
          />
        </Card>

        <Card style={{ marginBottom: spacing[6] }}>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: spacing[3],
            }}
          >
            Classes & subjects
          </Text>
          {profile.teacherSubjectAllocations.length === 0 ? (
            <Text
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              No classes assigned yet.
            </Text>
          ) : (
            <View style={{ gap: spacing[2] }}>
              {profile.teacherSubjectAllocations.map((item) => (
                <AllocationRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </Card>

        <Button label="Logout" variant="secondary" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}
