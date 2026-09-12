import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="leave/apply" options={{ presentation: "card" }} />
      <Stack.Screen
        name="my-class/view-attendance"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="subject-class/[allocationId]"
        options={{ presentation: "card" }}
      />
    </Stack>
  );
}
