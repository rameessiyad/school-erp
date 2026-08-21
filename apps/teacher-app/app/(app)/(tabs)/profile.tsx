// app/(app)/(tabs)/profile.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/store/auth.store";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Avatar } from "../../../src/components/ui/Avatar";
import { mockTeacherProfile } from "../../../src/data/mockDashboard";

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
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

export default function ProfileScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const { logout } = useAuthStore();

  // TODO: replace mockTeacherProfile with real data from a /teachers/me
  // endpoint once it exists on the backend.
  const profile = mockTeacherProfile;
  const fullName = `${profile.firstName} ${profile.lastName ?? ""}`.trim();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
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
        </View>

        <Card style={{ marginBottom: spacing[5] }}>
          <Text
            style={{
              fontFamily: fontFamily.semibold,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: spacing[2],
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
              marginBottom: spacing[2],
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
              profile.experience ? `${profile.experience} years` : undefined
            }
          />
          <DetailRow
            icon="calendar-outline"
            label="Joining date"
            value={profile.joiningDate}
          />
          <DetailRow
            icon="person-outline"
            label="Gender"
            value={profile.gender}
          />
        </Card>

        <Button label="Logout" variant="secondary" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}
