// app/index.tsx
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/store/auth.store";
import { useTheme } from "../src/theme/ThemeProvider";

export default function Index() {
  const { isAuthenticated, isHydrating, hydrate } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    hydrate();
  }, []);

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Redirect href={isAuthenticated ? "/(app)/(tabs)/home" : "/(auth)/login"} />
  );
}
