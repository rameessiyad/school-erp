import React from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useMyLeaveApplications } from "../../../src/hooks/useTeacherLeave";
import { TeacherLeaveApplication } from "../../../src/types/leave";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";

const STATUS_STYLE: Record<
  TeacherLeaveApplication["status"],
  { key: "warning" | "success" | "error"; label: string }
> = {
  PENDING: { key: "warning", label: "Pending" },
  APPROVED: { key: "success", label: "Approved" },
  REJECTED: { key: "error", label: "Rejected" },
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LeaveRow({ item }: { item: TeacherLeaveApplication }) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const style = STATUS_STYLE[item.status];
  const mainColor = {
    warning: colors.warning,
    success: colors.success,
    error: colors.error,
  }[style.key];
  const softColor = {
    warning: colors.warningSoft,
    success: colors.successSoft,
    error: colors.errorSoft,
  }[style.key];

  return (
    <Card style={{ marginBottom: spacing[3] }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            {formatDateShort(item.fromDate)} – {formatDateShort(item.toDate)}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 13,
              color: colors.textSecondary,
              marginTop: spacing[1],
            }}
          >
            {item.reason}
          </Text>
          {item.reviewNote && (
            <Text
              style={{
                fontFamily: fontFamily.regular,
                fontSize: 12,
                color: colors.textMuted,
                marginTop: spacing[2],
              }}
            >
              Note: {item.reviewNote}
            </Text>
          )}
        </View>

        <View
          style={{
            backgroundColor: softColor,
            paddingHorizontal: spacing[2] + 2,
            paddingVertical: 4,
            borderRadius: radius.full,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 11,
              color: mainColor,
            }}
          >
            {style.label}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function LeaveScreen() {
  const { colors, spacing, fontFamily } = useTheme();
  const { data, isLoading, isError, refetch, isRefetching } =
    useMyLeaveApplications();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View style={{ padding: spacing[6], paddingBottom: spacing[3] }}>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: 20,
            color: colors.textPrimary,
            marginBottom: spacing[4],
          }}
        >
          Leave applications
        </Text>
        <Button
          label="Apply for leave"
          onPress={() => router.push("/(app)/leave/apply")}
        />
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{ color: colors.textMuted, fontFamily: fontFamily.regular }}
          >
            Loading...
          </Text>
        </View>
      ) : isError ? (
        <View
          style={{
            flex: 1,
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
            }}
          >
            Couldn't load your leave applications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LeaveRow item={item} />}
          contentContainerStyle={{ padding: spacing[6], paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: spacing[10] }}>
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colors.textMuted}
              />
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.regular,
                  marginTop: spacing[3],
                }}
              >
                No leave applications yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
