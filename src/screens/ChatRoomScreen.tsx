import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Color";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:3000";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  session_id: string;
  created_at: string;
}

const ChatRoomScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // 타이핑 애니메이션
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (isSending) {
      // 점 애니메이션 시작
      const animation = Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: -8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: -8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: -8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();

      return () => {
        animation.stop();
        dot1Anim.setValue(0);
        dot2Anim.setValue(0);
        dot3Anim.setValue(0);
      };
    }
  }, [isSending]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // params에서 session_id 가져오기
      const existingSessionId = params.sessionId as string;

      if (existingSessionId) {
        // 기존 세션의 채팅 히스토리 조회
        setSessionId(existingSessionId);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/chat/history?session_id=${existingSessionId}`
        );

        if (response.ok) {
          const history = await response.json();
          console.log("채팅 이력:", history);
          setMessages(history);
        } else {
          console.error("채팅 이력 로드 실패");
        }
      } else {
        // 새 세션 - session_id는 첫 메시지 전송 시 생성됨
        setMessages([]);
      }
    } catch (error) {
      console.error("메시지 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    // 사용자 메시지 즉시 표시
    const tempUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    // 스크롤을 아래로
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      console.log("=== 채팅 메시지 전송 시작 ===");
      console.log("API URL:", `${API_BASE_URL}/api/v1/chat/`);
      console.log("전송 메시지:", messageText);
      console.log("현재 세션 ID:", sessionId || "새 세션 생성 예정");

      // 새 대화일 경우 session_id를 null로 보내거나 제거, 기존 대화일 경우 session_id 포함
      const requestBody: { message: string; session_id?: string | null } = {
        message: messageText,
      };

      if (sessionId) {
        // 기존 세션이 있으면 session_id 포함
        requestBody.session_id = sessionId;
      } else {
        // 새 세션이면 session_id를 null로 설정
        requestBody.session_id = null;
      }

      console.log("요청 Body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("서버 에러 응답:", errorText);
        throw new Error(`메시지 전송 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("=== AI 응답 성공 ===");
      console.log("응답 데이터:", JSON.stringify(data, null, 2));
      console.log("AI 메시지:", data.message);
      console.log("세션 ID:", data.session_id);
      console.log("사용된 토큰:", data.tokens_used);
      console.log("모델:", data.model);

      // session_id 저장 (첫 메시지 전송 시)
      if (!sessionId && data.session_id) {
        console.log("새 세션 ID 저장:", data.session_id);
        setSessionId(data.session_id);
      }

      // AI 응답 메시지 추가
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
        session_id: data.session_id,
        created_at: data.created_at,
      };
      setMessages((prev) => [...prev, aiMessage]);
      console.log("AI 메시지 추가 완료");

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("=== 메시지 전송 실패 ===");
      console.error("에러:", error);
      console.error(
        "에러 메시지:",
        error instanceof Error ? error.message : "알 수 없는 오류"
      );

      // 에러 메시지 표시
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.",
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      console.log("메시지 전송 프로세스 종료");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTextWithBold = (text: string, isUser: boolean) => {
    // **텍스트** 형식을 찾아서 Bold 처리, ^^텍스트^^ 형식을 찾아서 ExtraBold + 색상 처리
    const parts = text.split(/(\*\*.*?\*\*|\^\^.*?\^\^)/g);

    return (
      <Text
        style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.aiMessageText,
        ]}
      >
        {parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            // **로 감싸진 텍스트는 Bold 처리
            const boldText = part.slice(2, -2);
            return (
              <Text key={index} style={styles.boldText}>
                {boldText}
              </Text>
            );
          } else if (part.startsWith("^^") && part.endsWith("^^")) {
            // ^^로 감싸진 텍스트는 ExtraBold + 색상 처리
            const highlightText = part.slice(2, -2);
            return (
              <Text key={index} style={styles.highlightText}>
                {highlightText}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <Ionicons name="medical" size={20} color={Colors.second} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          ]}
        >
          {renderTextWithBold(message.content, isUser)}
          <Text
            style={[
              styles.messageTime,
              isUser ? styles.userMessageTime : styles.aiMessageTime,
            ]}
          >
            {formatTime(message.created_at)}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatarContainer}>
            <Ionicons name="person" size={20} color={Colors.white1} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.black2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI 다제 약물 관리 도우미</Text>
          <Text style={styles.headerSubtitle}>전문 약학 상담</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.black2} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* 채팅 영역 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.second}
              style={{ marginTop: 40 }}
            />
          ) : (
            <>
              {/* 안내 메시지 (메시지가 없을 때만 표시) */}
              {messages.length === 0 && (
                <View style={styles.welcomeContainer}>
                  <View style={styles.welcomeIconContainer}>
                    <Ionicons
                      name="chatbubbles"
                      size={32}
                      color={Colors.second}
                    />
                  </View>
                  <Text style={styles.welcomeTitle}>AI 약사 상담</Text>
                  <Text style={styles.welcomeDescription}>
                    약물 복용, 상호작용, 부작용 등{"\n"}
                    궁금하신 점을 편하게 물어보세요
                  </Text>
                </View>
              )}

              {/* 메시지 목록 */}
              {messages.map(renderMessage)}

              {/* 전송 중 표시 */}
              {isSending && (
                <View style={styles.typingIndicator}>
                  <View style={styles.aiAvatarContainer}>
                    <Ionicons name="medical" size={20} color={Colors.second} />
                  </View>
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { transform: [{ translateY: dot1Anim }] },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { transform: [{ translateY: dot2Anim }] },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          { transform: [{ translateY: dot3Anim }] },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* 입력 영역 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="AI 약사에게 궁금한 것을 물어보세요!"
              placeholderTextColor={Colors.gray2}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() && !isSending ? Colors.white1 : Colors.gray3
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray3,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.gray1,
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black2,
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: Colors.gray1,
    textAlign: "center",
    lineHeight: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.second,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 16,
    padding: 12,
  },
  userMessageBubble: {
    backgroundColor: Colors.second,
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: Colors.white1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white1,
  },
  aiMessageText: {
    color: Colors.black2,
  },
  boldText: {
    fontWeight: "700",
  },
  highlightText: {
    fontWeight: "800",
    color: "#FF6249",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: Colors.white1,
    opacity: 0.8,
    textAlign: "right",
  },
  aiMessageTime: {
    color: Colors.gray2,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: Colors.white1,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginLeft: 8,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray2,
  },
  inputContainer: {
    backgroundColor: Colors.white1,
    borderTopWidth: 1,
    borderTopColor: Colors.gray3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.gray4,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.black2,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.second,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray3,
  },
});

export default ChatRoomScreen;
