import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../src/constants/Color";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;
const USER_ID = 1; // 실제 사용자 ID로 변경

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.gray2} />
          <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>권한 허용</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isLoading) return;

    try {
      setIsLoading(true);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (!photo || !photo.base64) {
        throw new Error("사진 촬영에 실패했습니다");
      }

      // API 호출
      const response = await fetch(`${API_BASE_URL}/api/v1/analysis/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: photo.base64,
          user_id: USER_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const result = await response.json();

      // 결과 화면으로 이동
      router.push({
        pathname: "/drug-risk-analysis",
        params: {
          data: JSON.stringify(result),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("오류", "약물 분석에 실패했습니다. 다시 시도해주세요.", [
        { text: "확인" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때 표시할 화면
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.second} />
            <Text style={styles.loadingTitle}>약물 분석 중...</Text>
            <Text style={styles.loadingSubtitle}>
              AI가 약물 정보를 분석하고 있습니다{"\n"}
              잠시만 기다려주세요
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>약물 촬영</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 가이드 프레임 */}
        <View style={styles.guideContainer}>
          <View style={styles.guideFrame}>
            <Text style={styles.guideText}>약물을 프레임 안에 맞춰주세요</Text>
          </View>
        </View>

        {/* 하단 컨트롤 */}
        <View style={styles.controls}>
          <View style={styles.controlsInner}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              disabled={isLoading}
            >
              <Ionicons name="camera-reverse" size={32} color={Colors.white1} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isLoading && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={Colors.white1} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: Colors.gray1,
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: Colors.second,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white1,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white1,
  },
  placeholder: {
    width: 40,
  },
  guideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  guideFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: Colors.second,
    borderRadius: 20,
    justifyContent: "flex-end",
    padding: 20,
  },
  guideText: {
    fontSize: 14,
    color: Colors.white1,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 8,
  },
  controls: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.second,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.second,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black1,
    padding: 20,
  },
  loadingCard: {
    backgroundColor: Colors.white1,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: Colors.black1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black2,
    marginTop: 20,
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.gray2,
    textAlign: "center",
    lineHeight: 20,
  },
});
