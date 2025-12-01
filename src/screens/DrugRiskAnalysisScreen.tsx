import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Color";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface RiskItem {
  id: string;
  type: "duplicate" | "interaction" | "timing";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  percentage: number;
}

interface ScannedMedication {
  name: string;
  ingredient: string;
  amount: string;
}

interface CommentSection {
  icon: string;
  title: string;
  content: string;
}

interface DrugRiskAnalysisProps {
  scannedMedication?: ScannedMedication;
  overallRiskScore?: number;
  riskLevel?: "high" | "medium" | "low";
  riskItems?: RiskItem[];
  warnings?: string[];
  summary?: string;
  sections?: CommentSection[];
}

const DrugRiskAnalysisScreen = ({
  scannedMedication = {
    name: "타이레놀 500mg",
    ingredient: "아세트아미노펜",
    amount: "500mg",
  },
  overallRiskScore = 8,
  riskLevel = "high",
  riskItems = [],
  warnings = [],
  summary = "",
  sections = [],
}: DrugRiskAnalysisProps = {}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const maxScore = 10;

  const handleCancel = () => {
    router.push("/camera");
  };

  const handleAddMedicine = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/medicines/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: scannedMedication.name,
          ingredient: scannedMedication.ingredient,
          amount: scannedMedication.amount,
          scan_report: {
            overallRiskScore,
            riskLevel,
            riskItems,
            warnings,
            summary,
            sections,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("약 등록에 실패했습니다.");
      }

      const data = await response.json();
      Alert.alert("성공", "약이 성공적으로 등록되었습니다.", [
        { text: "확인", onPress: () => router.push("/") },
      ]);
    } catch (error) {
      Alert.alert(
        "오류",
        error instanceof Error
          ? error.message
          : "약 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const needsConsultation = overallRiskScore >= 7;

  // 더미 데이터 (props가 없을 때 사용)
  const defaultRiskItems: RiskItem[] = [
    {
      id: "1",
      type: "duplicate",
      severity: "high",
      title: "성분 중복",
      description: "아세트아미노펜 성분이 2개 이상의 약물에 포함되어 있습니다",
      percentage: 85,
    },
    {
      id: "2",
      type: "interaction",
      severity: "high",
      title: "상호작용 위험",
      description: "이부프로펜과 아스피린 병용 시 위 점막 손상 가능",
      percentage: 75,
    },
    {
      id: "3",
      type: "timing",
      severity: "medium",
      title: "복용 시간 충돌",
      description: "3개의 약물이 동일한 시간대에 복용 예정입니다",
      percentage: 60,
    },
  ];

  const defaultWarnings = [
    "현재 복용 중인 약 중 '아세트아미노펜' 성분이 중복되어 간 독성 위험이 있습니다.",
    "이부프로펜과 아스피린 병용은 위 점막 손상 가능성이 있습니다.",
  ];

  const defaultSummary =
    "현재 복용 중인 약물들의 성분을 분석한 결과, 아세트아미노펜 성분이 중복되어 있어 간 손상 위험이 있습니다.";

  const defaultSections: CommentSection[] = [
    {
      icon: "time",
      title: "권장 복용 방법",
      content:
        "• 타이레놀은 아침 8시에 복용\n• 이부프로펜이 포함된 약은 최소 6시간 간격을 두고 오후 2시 이후 복용\n• 하루 아세트아미노펜 총 섭취량이 4000mg을 넘지 않도록 주의",
    },
    {
      icon: "alert-circle",
      title: "주의사항",
      content:
        "• 공복 복용 시 위장 장애가 발생할 수 있으니 식후 30분 이내 복용 권장\n• 음주 시 간 손상 위험이 증가하므로 복용 기간 중 금주 필요\n• 3일 이상 증상이 지속되면 복용을 중단하고 의사와 상담하세요",
    },
    {
      icon: "swap-horizontal",
      title: "대체 방안",
      content:
        "성분 중복을 피하고 싶다면 아세트아미노펜이 없는 소염진통제로 대체하거나, 약사와 상담하여 용량 조절을 고려해보세요.",
    },
  ];

  // 실제 사용할 데이터 (props 우선, 없으면 더미 데이터)
  const displayRiskItems = riskItems.length > 0 ? riskItems : defaultRiskItems;
  const displayWarnings = warnings.length > 0 ? warnings : defaultWarnings;
  const displaySummary = summary || defaultSummary;
  const displaySections = sections.length > 0 ? sections : defaultSections;

  const getRiskColor = (level: "high" | "medium" | "low"): [string, string] => {
    switch (level) {
      case "high":
        return [Colors.error, Colors.primary];
      case "medium":
        return [Colors.warning, Colors.second];
      case "low":
        return [Colors.success, Colors.success];
    }
  };

  const getRiskIcon = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "alert-circle";
      case "medium":
        return "warning";
      case "low":
        return "checkmark-circle";
    }
  };

  const getTypeIcon = (type: "duplicate" | "interaction" | "timing") => {
    switch (type) {
      case "duplicate":
        return "copy-outline";
      case "interaction":
        return "git-network-outline";
      case "timing":
        return "time-outline";
    }
  };

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return Colors.error;
      case "medium":
        return Colors.warning;
      case "low":
        return Colors.success;
    }
  };

  // **텍스트** 파싱하여 bold 처리
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <Text>
        {parts.map((part, index) => {
          // 홀수 인덱스는 bold 처리
          if (index % 2 === 1) {
            return (
              <Text key={index} style={{ fontWeight: "bold" }}>
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>약물 위험 분석</Text>
          <Text style={styles.headerSubtitle}>종합 안전성 평가</Text>
        </View>

        {/* 촬영한 약물 정보 */}
        <View style={styles.scannedMedSection}>
          <View style={styles.scannedMedCard}>
            <View style={styles.scannedMedHeader}>
              <Ionicons name="camera" size={20} color="#FF6249" />
              <Text style={styles.scannedMedLabel}>촬영한 약물</Text>
            </View>
            <Text style={styles.scannedMedName}>{scannedMedication.name}</Text>
            <View style={styles.scannedMedDetails}>
              <View style={styles.scannedMedDetailItem}>
                <Text style={styles.scannedMedDetailLabel}>성분명</Text>
                <Text style={styles.scannedMedDetailValue}>
                  {scannedMedication.ingredient}
                </Text>
              </View>
              <View style={styles.scannedMedDetailItem}>
                <Text style={styles.scannedMedDetailLabel}>함량</Text>
                <Text style={styles.scannedMedDetailValue}>
                  {scannedMedication.amount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 전체 위험도 점수 카드 */}
        <LinearGradient
          colors={getRiskColor(riskLevel)}
          style={styles.scoreCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.scoreHeader}>
            <Ionicons name={getRiskIcon(riskLevel)} size={40} color="white" />
            <View style={styles.scoreTextContainer}>
              <Text style={styles.scoreLabel}>전체 위험도</Text>
              <Text style={styles.riskLevelText}>
                {riskLevel === "high"
                  ? "높음"
                  : riskLevel === "medium"
                  ? "보통"
                  : "낮음"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreMainContainer}>
            <Text style={styles.scoreMain}>{overallRiskScore}</Text>
            <Text style={styles.scoreMax}>/ {maxScore}</Text>
          </View>

          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${(overallRiskScore / maxScore) * 100}%` },
              ]}
            />
          </View>

          {needsConsultation && (
            <View style={styles.consultationBadge}>
              <Ionicons name="medical" size={16} color="white" />
              <Text style={styles.consultationText}>약사 상담 권장</Text>
            </View>
          )}
        </LinearGradient>

        {/* 주의사항 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={24} color={Colors.second} />
            <Text style={styles.sectionTitle}>약물 상호작용 경고</Text>
          </View>

          <View style={styles.warningContainer}>
            {displayWarnings.map((message, index) => (
              <View key={index} style={styles.warningItem}>
                <View style={styles.warningNumber}>
                  <Text style={styles.warningNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.warningText}>{message}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 위험 상세 리스트 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={Colors.second} />
            <Text style={styles.sectionTitle}>위험 항목 상세</Text>
          </View>

          {displayRiskItems.map((item) => (
            <View key={item.id} style={styles.riskCard}>
              <View style={styles.riskCardHeader}>
                <View style={styles.riskCardTitleContainer}>
                  <View
                    style={[
                      styles.riskIconContainer,
                      {
                        backgroundColor: `${getSeverityColor(item.severity)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(item.type)}
                      size={20}
                      color={getSeverityColor(item.severity)}
                    />
                  </View>
                  <View style={styles.riskCardTitleText}>
                    <Text style={styles.riskCardTitle}>{item.title}</Text>
                    <Text
                      style={[
                        styles.severityBadge,
                        { color: getSeverityColor(item.severity) },
                      ]}
                    >
                      {item.severity === "high"
                        ? "위험도: 높음"
                        : item.severity === "medium"
                        ? "위험도: 보통"
                        : "위험도: 낮음"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.percentageText}>{item.percentage}%</Text>
              </View>

              <Text style={styles.riskCardDescription}>{item.description}</Text>

              {/* 진행률 바 */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getSeverityColor(item.severity),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 전문가 소견 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={Colors.second} />
            <Text style={styles.sectionTitle}>AI 약사 코멘트</Text>
          </View>

          <View style={styles.aiCommentCard}>
            <View style={styles.aiCommentHeader}>
              <View style={styles.aiIconBadge}>
                <Ionicons name="medical" size={20} color={Colors.second} />
              </View>
              <Text style={styles.aiCommentTitle}>복용 가이드</Text>
            </View>

            <Text style={styles.aiSummaryText}>
              {renderTextWithBold(displaySummary)}
            </Text>

            {displaySections.map((section, index) => (
              <View key={index} style={styles.aiSection}>
                <View style={styles.aiSectionHeader}>
                  <Ionicons
                    name={section.icon as any}
                    size={20}
                    color={Colors.second}
                  />
                  <Text style={styles.aiSectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.aiSectionContent}>
                  {renderTextWithBold(section.content)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>취소하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddMedicine}
          >
            <Text style={styles.addButtonText}>내 약 추가하기</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray4,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.black2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray2,
  },
  scannedMedSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  scannedMedCard: {
    backgroundColor: Colors.white1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.second,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scannedMedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scannedMedLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.second,
    marginLeft: 6,
  },
  scannedMedName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black2,
    marginBottom: 16,
  },
  scannedMedDetails: {
    flexDirection: "row",
    gap: 20,
  },
  scannedMedDetailItem: {
    flex: 1,
  },
  scannedMedDetailLabel: {
    fontSize: 12,
    color: Colors.gray2,
    marginBottom: 4,
  },
  scannedMedDetailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gray1,
  },
  scoreCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: Colors.black1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTextContainer: {
    marginLeft: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.white1,
    opacity: 0.9,
  },
  riskLevelText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white1,
  },
  scoreMainContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreMain: {
    fontSize: 72,
    fontWeight: "bold",
    color: Colors.white1,
  },
  scoreMax: {
    fontSize: 32,
    color: Colors.white1,
    opacity: 0.8,
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: Colors.white1,
    borderRadius: 4,
  },
  consultationBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
  },
  consultationText: {
    color: Colors.white1,
    fontWeight: "600",
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black2,
    marginLeft: 8,
  },
  warningContainer: {
    backgroundColor: Colors.white1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  warningItem: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray3,
  },
  warningNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white2,
    borderWidth: 1.5,
    borderColor: Colors.second,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  warningNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.second,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray1,
  },
  riskCard: {
    backgroundColor: Colors.white1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  riskCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  riskCardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  riskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  riskCardTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  riskCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 4,
  },
  severityBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black2,
  },
  riskCardDescription: {
    fontSize: 14,
    color: Colors.gray2,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray3,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  aiCommentCard: {
    backgroundColor: Colors.white1,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.second,
    shadowColor: Colors.black1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCommentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  aiCommentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black2,
  },
  aiSummaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.gray1,
    marginBottom: 20,
  },
  aiSection: {
    marginBottom: 16,
  },
  aiSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black2,
  },
  aiSectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.gray1,
  },
  buttonSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white1,
    borderWidth: 1.5,
    borderColor: Colors.gray2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.second,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white1,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DrugRiskAnalysisScreen;
