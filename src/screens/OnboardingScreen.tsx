import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Color";
import { api } from "../services/api";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [conditions, setConditions] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCondition = () => {
    setConditions([...conditions, ""]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index);
      setConditions(newConditions);
    }
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
  };

  const handleSubmit = async () => {
    // 빈 문자열 제거
    const filteredConditions = conditions.filter((c) => c.trim() !== "");

    if (filteredConditions.length === 0) {
      Alert.alert("알림", "최소 1개 이상의 지병 정보를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitMedicalConditions(filteredConditions);
      Alert.alert("성공", "지병 정보가 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error ? error.message : "저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert("확인", "지병 정보를 입력하지 않고 건너뛰시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "건너뛰기",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>지병 정보 입력</Text>
          <Text style={styles.subtitle}>
            현재 가지고 계신 지병이 있다면 입력해주세요.{"\n"}
            정확한 약물 상호작용 분석에 도움이 됩니다.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {conditions.map((condition, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={`지병 ${index + 1}`}
                value={condition}
                onChangeText={(value) => updateCondition(index, value)}
                returnKeyType="next"
              />
              {conditions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCondition(index)}
                >
                  <Text style={styles.removeButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addCondition}>
            <Text style={styles.addButtonText}>+ 지병 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isSubmitting}
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "저장 중..." : "완료"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  formContainer: {
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  removeButtonText: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  skipButton: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#FFA4A4",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
