import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Color";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:3000";

interface ChatRoom {
  id: string; // session_id를 사용하므로 string으로 변경
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const ChatListScreen = () => {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      console.log("=== 상담 내역 로드 시작 ===");
      console.log("API URL:", `${API_BASE_URL}/api/v1/chat/sessions`);

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions`);

      console.log("응답 상태:", response.status);

      if (!response.ok) {
        throw new Error("상담 내역 로드 실패");
      }

      const data = await response.json();
      console.log("받은 상담 내역:", JSON.stringify(data, null, 2));
      console.log("상담 내역 개수:", data?.length || 0);

      // API 응답을 ChatRoom 형식으로 변환
      const rooms: ChatRoom[] = data.map((session: any) => ({
        id: session.session_id,
        title: session.title || "상담",
        lastMessage: session.last_message || "",
        lastMessageTime: formatMessageTime(session.last_message_time),
        unreadCount: 0, // 필요시 API에서 제공
      }));

      setChatRooms(rooms);
    } catch (error) {
      console.error("채팅 목록 로드 실패:", error);
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (days === 1) {
      return "어제";
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleCreateNewChat = () => {
    router.push("/chat-room?new=true");
  };

  const handleChatRoomPress = (sessionId: string) => {
    router.push(`/chat-room?sessionId=${sessionId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.second}
          style={{ marginTop: 100 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 새 상담 시작 버튼 */}
        <View style={styles.newChatSection}>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={handleCreateNewChat}
          >
            <View style={styles.newChatIconContainer}>
              <Ionicons name="add-circle" size={32} color={Colors.white1} />
            </View>
            <View style={styles.newChatTextContainer}>
              <Text style={styles.newChatTitle}>새로운 상담 시작하기</Text>
              <Text style={styles.newChatDescription}>
                AI 약사에게 궁금한 점을 물어보세요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.white1} />
          </TouchableOpacity>
        </View>

        {/* 채팅 목록 */}
        <View style={styles.chatListSection}>
          <Text style={styles.sectionTitle}>상담 내역</Text>

          {chatRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={Colors.gray3}
              />
              <Text style={styles.emptyText}>아직 상담 내역이 없습니다</Text>
              <Text style={styles.emptySubtext}>
                새로운 상담을 시작해보세요!
              </Text>
            </View>
          ) : (
            chatRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.chatRoomItem}
                onPress={() => handleChatRoomPress(room.id)}
              >
                <View style={styles.chatRoomIconContainer}>
                  <Ionicons name="medical" size={24} color={Colors.second} />
                </View>

                <View style={styles.chatRoomContent}>
                  <View style={styles.chatRoomHeader}>
                    <Text style={styles.chatRoomTitle} numberOfLines={1}>
                      {room.title}
                    </Text>
                    <Text style={styles.chatRoomTime}>
                      {room.lastMessageTime}
                    </Text>
                  </View>

                  <View style={styles.chatRoomFooter}>
                    <Text style={styles.chatRoomMessage} numberOfLines={1}>
                      {room.lastMessage}
                    </Text>
                    {room.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {room.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray4,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.white1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#C0C0C0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black2,
  },
  newChatSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.second,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  newChatIconContainer: {
    marginRight: 16,
  },
  newChatTextContainer: {
    flex: 1,
  },
  newChatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white1,
    marginBottom: 4,
  },
  newChatDescription: {
    fontSize: 14,
    color: Colors.white1,
    opacity: 0.9,
  },
  chatListSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black2,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray2,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray1,
  },
  chatRoomItem: {
    flexDirection: "row",
    backgroundColor: Colors.white1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  chatRoomIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatRoomContent: {
    flex: 1,
  },
  chatRoomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chatRoomTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black2,
    marginRight: 8,
  },
  chatRoomTime: {
    fontSize: 12,
    color: Colors.gray1,
  },
  chatRoomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatRoomMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.second,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white1,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ChatListScreen;
