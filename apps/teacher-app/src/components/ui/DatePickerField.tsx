import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  minimumDate,
}: DatePickerFieldProps) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (event.type === "set" && selected) onChange(selected);
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <Text
        style={{
          fontFamily: fontFamily.medium,
          fontSize: 12,
          color: colors.textSecondary,
        }}
      >
        {label}
      </Text>

      <Pressable
        onPress={() => setShow(true)}
        style={{
          height: spacing[11],
          paddingHorizontal: spacing[3] + 2,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: colors.surfaceSecondary,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.regular,
            fontSize: 14,
            color: value ? colors.textPrimary : colors.textMuted,
          }}
        >
          {value ? value.toDateString() : "Select date"}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      </Pressable>

      {error && (
        <Text style={{ fontSize: 12, color: colors.error }}>{error}</Text>
      )}

      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}
