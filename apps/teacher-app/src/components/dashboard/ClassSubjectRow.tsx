// src/components/dashboard/ClassSubjectRow.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { TeacherClassSubject } from "../../types/teacher";

export function ClassSubjectRow({ item }: { item: TeacherClassSubject }) {
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
          {item.subjectName}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {item.className} · Section {item.sectionName}
        </Text>
      </View>

      {item.isClassTeacher && (
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
            Class Teacher
          </Text>
        </View>
      )}
    </View>
  );
}
