import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack screenOptions={{ animation: "none", headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="camera"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="drug-risk-analysis"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="schedule"
          options={{
            headerShown: true,
            title: "일정",
          }}
        />
        <Stack.Screen
          name="medicine"
          options={{
            headerShown: true,
            title: "내 약",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat-room"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}
