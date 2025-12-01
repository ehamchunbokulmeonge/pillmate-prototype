import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const pathname = usePathname();

  // 헤더/푸터를 숨길 페이지 목록
  const hideHeaderFooter = [
    "/onboarding",
    "/camera",
    "/drug-risk-analysis",
    "/add-medicine-reminder",
    "/my-medicines-analysis",
    "/chat",
  ].includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {!hideHeaderFooter && <AppHeader />}
      <Stack screenOptions={{ animation: "none", headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="drug-risk-analysis" />
        <Stack.Screen name="my-medicines-analysis" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="medicine" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="add-medicine-reminder" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!hideHeaderFooter && <TabBar />}
      <StatusBar style="auto" />
    </View>
  );
}
