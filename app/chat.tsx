import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import { View } from "react-native";
import ChatListScreen from "../src/screens/ChatListScreen";

export default function ChatScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <ChatListScreen />
      <TabBar />
    </View>
  );
}
