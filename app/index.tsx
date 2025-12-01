import MainScreen from "@/screens/MainScreen";
import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <MainScreen />
      <TabBar />
    </View>
  );
}
