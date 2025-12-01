import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  data?: {
    scannedMedication?: ScannedMedication;
    overallRiskScore?: number;
    riskLevel?: "high" | "medium" | "low";
    riskItems?: RiskItem[];
    warnings?: string[];
    summary?: string;
    sections?: CommentSection[];
  };
  medicineId?: string;
}

const DrugRiskAnalysisScreen = ({
  data,
  medicineId,
}: DrugRiskAnalysisProps) => {
  console.log("=== DrugRiskAnalysisScreen 렌더링 ===");
  console.log("Received data:", JSON.stringify(data, null, 2));
  console.log("MedicineId:", medicineId);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [medicineDetail, setMedicineDetail] = useState<any>(null);
  const maxScore = 10;

  // 약 페이지에서 온 경우 (medicineId가 있으면) 버튼 숨김
  const isFromMedicinePage = !!medicineId;

  // medicineId가 있으면 API 호출
  React.useEffect(() => {
    if (medicineId) {
      fetchMedicineDetail();
    }
  }, [medicineId]);

  const fetchMedicineDetail = async () => {
    if (!medicineId) return;

    try {
      setIsLoading(true);
      const apiUrl = `${API_BASE_URL}/api/v1/medicines/${medicineId}`;

      console.log("=== 약물 상세 조회 API 요청 ===");
      console.log("API URL:", apiUrl);
      console.log("Medicine ID:", medicineId);

      const response = await fetch(apiUrl);

      console.log("응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("에러 응답:", errorText);
        throw new Error("약물 상세 조회 실패");
      }

      const detail = await response.json();
      console.log("=== 약물 상세 조회 응답 ===");
      console.log("전체 detail:", JSON.stringify(detail, null, 2));
      console.log("detail의 모든 키:", Object.keys(detail));
      console.log("scan_report 존재 여부:", !!detail.scan_report);
      console.log("scan_report 타입:", typeof detail.scan_report);
      console.log("scan_report 내용:", detail.scan_report);

      // scan_report가 있으면 그 내용을 사용
      if (detail.scan_report) {
        let reportData;
        try {
          reportData =
            typeof detail.scan_report === "string"
              ? JSON.parse(detail.scan_report)
              : detail.scan_report;

          console.log("=== 파싱된 scan_report ===");
          console.log("reportData 전체:", JSON.stringify(reportData, null, 2));
          console.log("reportData의 모든 키:", Object.keys(reportData));

          // 가능한 모든 필드명 확인
          console.log("overallRiskScore:", reportData.overallRiskScore);
          console.log("risk_score:", reportData.risk_score);
          console.log("riskLevel:", reportData.riskLevel);
          console.log("risk_level:", reportData.risk_level);
          console.log("riskItems:", reportData.riskItems);
          console.log("interactions:", reportData.interactions);
          console.log("warnings:", reportData.warnings);
          console.log("summary:", reportData.summary);
          console.log("sections:", reportData.sections);
        } catch (parseError) {
          console.error("scan_report 파싱 에러:", parseError);
          reportData = {};
        }

        // API 응답 필드명을 화면에서 사용하는 필드명으로 매핑
        const mergedData = {
          scannedMedication: {
            name: detail.name,
            ingredient: detail.ingredient,
            amount: detail.amount,
          },
          overallRiskScore:
            reportData.overallRiskScore ?? reportData.risk_score ?? 0,
          riskLevel: reportData.riskLevel || reportData.risk_level || "low",
          riskItems: reportData.riskItems || reportData.interactions || [],
          warnings: reportData.warnings || [],
          summary: reportData.summary || "",
          sections: reportData.sections || [],
        };

        console.log("=== 최종 병합된 데이터 ===");
        console.log("overallRiskScore:", mergedData.overallRiskScore);
        console.log("riskLevel:", mergedData.riskLevel);
        console.log("riskItems 길이:", mergedData.riskItems.length);
        console.log("warnings 길이:", mergedData.warnings.length);
        console.log("sections 길이:", mergedData.sections.length);

        setMedicineDetail(mergedData);
      } else {
        console.log("scan_report 없음 - 기본 데이터 사용");
        setMedicineDetail({
          scannedMedication: {
            name: detail.name,
            ingredient: detail.ingredient,
            amount: detail.amount,
          },
          overallRiskScore: 0,
          riskLevel: "low",
          riskItems: [],
          warnings: [],
          summary: "",
          sections: [],
        });
      }
    } catch (error) {
      console.error("약물 상세 조회 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // medicineDetail이 있으면 그것을 사용, 없으면 data 사용
  const displayData = medicineDetail || data;

  // 기본값 설정
  const scannedMedication = displayData?.scannedMedication || {
    name: displayData?.name || "",
    ingredient: displayData?.ingredient || "",
    amount: displayData?.amount || "",
  };
  const overallRiskScore = displayData?.overallRiskScore ?? 0;
  const riskLevel = displayData?.riskLevel || "low";
  const riskItems = displayData?.riskItems || [];
  const warnings = displayData?.warnings || [];
  const summary = displayData?.summary || "";
  const sections = displayData?.sections || [];

  console.log("사용할 데이터:", {
    scannedMedication,
    overallRiskScore,
    riskLevel,
    riskItemsCount: riskItems.length,
    warningsCount: warnings.length,
  });

  const handleCancel = () => {
    router.push("/camera");
  };

  const handleAddMedicine = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const requestBody = {
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
      };

      console.log("=== 약 등록 API 요청 시작 ===");
      console.log("API URL:", `${API_BASE_URL}/api/v1/medicines/`);
      console.log("요청 본문:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/v1/medicines/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("에러 응답:", errorText);
        throw new Error("약 등록에 실패했습니다.");
      }

      const data = await response.json();
      console.log("응답 데이터:", JSON.stringify(data, null, 2));
      console.log("=== 약 등록 API 완료 ===");

      // 약 등록 성공 후 복용 알림 설정 페이지로 이동
      router.push({
        pathname: "/add-medicine-reminder",
        params: {
          medicineId: data.id,
          medicineName: scannedMedication.name,
          medicineIngredient: scannedMedication.ingredient,
          medicineAmount: scannedMedication.amount,
        },
      });
    } catch (error) {
      console.error("약 등록 에러:", error);
      alert(
        error instanceof Error
          ? error.message
          : "약 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const needsConsultation = overallRiskScore >= 7;

  // 데이터가 실제로 있는지 확인
  const hasRealData =
    riskItems.length > 0 ||
    warnings.length > 0 ||
    summary ||
    sections.length > 0;

  // 실제 사용할 데이터
  const displayRiskItems = riskItems;
  const displayWarnings = warnings;
  const displaySummary = summary;
  const displaySections = sections;

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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.second} />
          <Text style={styles.loadingText}>약물 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {hasRealData ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="medical-outline"
                  size={24}
                  color={Colors.second}
                />
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
                            backgroundColor: `${getSeverityColor(
                              item.severity
                            )}20`,
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
                    <Text style={styles.percentageText}>
                      {item.percentage}%
                    </Text>
                  </View>

                  <Text style={styles.riskCardDescription}>
                    {item.description}
                  </Text>

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
          </>
        ) : (
          // 데이터가 없을 때 안전 메시지
          <View style={styles.section}>
            <View style={styles.safeMessageCard}>
              <View style={styles.safeMessageIconContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={60}
                  color={Colors.success}
                />
              </View>
              <Text style={styles.safeMessageTitle}>안전합니다</Text>
              <Text style={styles.safeMessageText}>
                현재 복용 중인 약물이 없으므로{"\n"}
                중복 성분이나 약물 상호작용의 위험은 없습니다.
              </Text>
              <View style={styles.safeMessageTip}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={Colors.second}
                />
                <Text style={styles.safeMessageTipText}>
                  이 약을 등록하면 향후 다른 약과의 상호작용을 분석할 수
                  있습니다.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 전문가 소견 섹션 */}
        {hasRealData && (
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
        )}

        {/* 버튼 영역 (약 페이지에서 온 경우 숨김) */}
        {!isFromMedicinePage && (
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>취소하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMedicine}
            >
              <Text style={styles.addButtonText}>내 약 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray1,
  },
  safeMessageCard: {
    backgroundColor: Colors.white1,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  safeMessageIconContainer: {
    marginBottom: 20,
  },
  safeMessageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.success,
    marginBottom: 12,
  },
  safeMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.gray1,
    textAlign: "center",
    marginBottom: 24,
  },
  safeMessageTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white2,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  safeMessageTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray1,
  },
});

export default DrugRiskAnalysisScreen;
