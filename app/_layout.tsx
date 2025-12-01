import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AppHeader />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ animation: "none", headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="camera" />
          <Stack.Screen
            name="drug-risk-analysis"
            options={{
              headerShown: true,
              title: "약물 위험 분석",
              headerBackTitle: "뒤로",
            }}
          />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="medicine" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </View>
      <TabBar />
      <StatusBar style="auto" />
    </View>
  );
}
