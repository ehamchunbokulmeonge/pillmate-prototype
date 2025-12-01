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

interface Medicine {
  id: number;
  name: string;
  ingredient: string;
  amount: string;
  is_active: boolean;
}

interface Schedule {
  id: number;
  medicine_id: number;
  medicine_name: string;
  dose_count: number;
  dose_time: string;
}

const MainScreen = () => {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("=== MainScreen 데이터 로드 시작 ===");
      console.log("API URL:", API_BASE_URL);

      // 실제 API 호출
      const [scheduleResponse, medicineResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/schedules/today`),
        fetch(`${API_BASE_URL}/api/v1/medicines/`),
      ]);

      console.log("Schedule API 응답 상태:", scheduleResponse.status);
      console.log("Medicine API 응답 상태:", medicineResponse.status);

      const scheduleData = await scheduleResponse.json();
      const medicineData = await medicineResponse.json();

      console.log("받은 스케줄 데이터:", JSON.stringify(scheduleData, null, 2));
      console.log("받은 약물 데이터:", JSON.stringify(medicineData, null, 2));
      console.log("스케줄 개수:", scheduleData?.length || 0);
      console.log("약물 개수:", medicineData?.length || 0);

      setSchedules(scheduleData);
      setMedicines(medicineData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // 에러 시 빈 배열
      setSchedules([]);
      setMedicines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextSchedule = () => {
    console.log("=== getNextSchedule 호출 ===");
    console.log("전체 스케줄 개수:", schedules.length);

    if (schedules.length === 0) {
      console.log("스케줄이 비어있음");
      return null;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    console.log(
      "현재 시간:",
      `${now.getHours()}:${now.getMinutes()} (${currentTime}분)`
    );

    // dose_time을 시간(분)으로 변환하여 현재 시간 이후의 가장 가까운 스케줄 찾기
    const upcomingSchedules = schedules
      .map((schedule) => {
        // dose_time이 "08:00:00" 형식인 경우 처리
        const timeString = schedule.dose_time;
        console.log(`원본 dose_time: ${timeString}`);

        // HH:MM:SS 형식에서 시간과 분 추출
        const timeParts = timeString.split(":");
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const scheduleMinutes = hours * 60 + minutes;

        console.log(
          `스케줄: ${
            schedule.medicine_name
          }, 시간: ${hours}:${minutes} (${scheduleMinutes}분), 차이: ${
            scheduleMinutes - currentTime
          }분`
        );
        return {
          ...schedule,
          scheduleMinutes,
          diff: scheduleMinutes - currentTime,
        };
      })
      .filter((s) => s.diff >= 0);

    console.log("다가오는 스케줄 개수:", upcomingSchedules.length);

    if (upcomingSchedules.length === 0) {
      console.log("다가오는 스케줄 없음 (모두 지나감)");
      return null;
    }

    // 가장 가까운 스케줄 반환
    const nextSchedule = upcomingSchedules.sort((a, b) => a.diff - b.diff)[0];
    console.log(
      "다음 스케줄:",
      nextSchedule.medicine_name,
      formatTime(nextSchedule.dose_time)
    );
    return nextSchedule;
  };

  const formatTime = (timeString: string) => {
    // "08:00:00" 형식에서 HH:MM만 추출
    const timeParts = timeString.split(":");
    return `${timeParts[0]}:${timeParts[1]}`;
  };

  const handleMedicinePress = async (medicineId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/medicines/${medicineId}`
      );
      const medicineDetail = await response.json();

      // 약 상세 정보를 보여주는 화면으로 이동 (나중에 구현)
      console.log("약 상세 정보:", medicineDetail);
      // router.push({ pathname: '/medicine-detail', params: { data: JSON.stringify(medicineDetail) } });
    } catch (error) {
      console.error("약 상세 정보 로드 실패:", error);
    }
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

  const activeMedicines = medicines.filter((m) => m.is_active);
  const nextSchedule = getNextSchedule();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 약물 촬영 배너 */}
        <TouchableOpacity
          style={styles.cameraBanner}
          onPress={() => router.push("/camera")}
        >
          <View style={styles.cameraBannerContent}>
            <View style={styles.cameraBannerLeft}>
              <View style={styles.cameraBannerIconContainer}>
                <Ionicons name="camera" size={36} color={Colors.white1} />
              </View>
              <View style={styles.cameraBannerTextContainer}>
                <Text style={styles.cameraBannerTitle}>약물 촬영하기</Text>
                <Text style={styles.cameraBannerDescription}>
                  약을 촬영하여 위험성 분석
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={28} color={Colors.white1} />
          </View>
        </TouchableOpacity>

        {/* 다음 복용 스케줄 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color={Colors.second} />
            <Text style={styles.sectionTitle}>다음 복용 스케줄</Text>
          </View>

          <View style={styles.scheduleCard}>
            {nextSchedule ? (
              <View style={styles.nextScheduleContent}>
                <View style={styles.scheduleIconContainer}>
                  <Ionicons name="alarm" size={32} color={Colors.second} />
                </View>
                <View style={styles.scheduleDetailContainer}>
                  <Text style={styles.nextScheduleTime}>
                    {formatTime(nextSchedule.dose_time)}
                  </Text>
                  <Text style={styles.nextScheduleMedicine}>
                    {nextSchedule.medicine_name}
                  </Text>
                  <Text style={styles.nextScheduleDose}>
                    {nextSchedule.dose_count}정 복용
                  </Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>전체보기</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.gray1}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.completedContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={Colors.success}
                />
                <Text style={styles.completedTitle}>
                  오늘 약을 다 먹었어요!
                </Text>
                <Text style={styles.completedSubtitle}>
                  건강 관리 잘하셨어요 👍
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 내 약 요약 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={24} color={Colors.second} />
            <Text style={styles.sectionTitle}>내 약 요약</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="medkit" size={28} color={Colors.second} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryValue}>
                  {activeMedicines.length}개
                </Text>
                <Text style={styles.summaryLabel}>복용 중인 약</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="calendar" size={28} color={Colors.info} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryValue}>{schedules.length}회</Text>
                <Text style={styles.summaryLabel}>오늘 복용 횟수</Text>
              </View>
            </View>
          </View>

          {/* 약 목록 (최대 3개만 표시) */}
          {activeMedicines.length > 0 ? (
            <>
              {activeMedicines.slice(0, 3).map((medicine) => (
                <TouchableOpacity
                  key={medicine.id}
                  style={styles.medicineItem}
                  onPress={() => handleMedicinePress(medicine.id)}
                >
                  <View style={styles.medicineIconContainer}>
                    <Ionicons name="medical" size={20} color={Colors.second} />
                  </View>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                    <Text style={styles.medicineDetails}>
                      {medicine.ingredient} · {medicine.amount}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.gray2}
                  />
                </TouchableOpacity>
              ))}

              {activeMedicines.length > 3 && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>
                    +{activeMedicines.length - 3}개 더보기
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.gray1}
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyMedicineContainer}>
              <Ionicons name="medical-outline" size={48} color={Colors.gray3} />
              <Text style={styles.emptyMedicineText}>등록된 약이 없습니다</Text>
            </View>
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
  cameraBanner: {
    backgroundColor: Colors.second,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
  cameraBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cameraBannerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cameraBannerTextContainer: {
    flex: 1,
  },
  cameraBannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white1,
    marginBottom: 6,
  },
  cameraBannerDescription: {
    fontSize: 14,
    color: Colors.white1,
    opacity: 0.9,
  },
  header: {
    backgroundColor: Colors.white1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.black2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.gray1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black2,
  },
  scheduleCard: {
    backgroundColor: Colors.white1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  nextScheduleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scheduleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white2,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleDetailContainer: {
    flex: 1,
  },
  nextScheduleTime: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.second,
    marginBottom: 4,
  },
  nextScheduleMedicine: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 2,
  },
  nextScheduleDose: {
    fontSize: 14,
    color: Colors.gray1,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.gray1,
  },
  completedContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black2,
    marginTop: 16,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 14,
    color: Colors.gray1,
  },
  scheduleProgress: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray3,
  },
  scheduleProgressText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.gray3,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.second,
    borderRadius: 4,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  scheduleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray2,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleCheckboxChecked: {
    backgroundColor: Colors.second,
    borderColor: Colors.second,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleMedicine: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 2,
  },
  scheduleMedicineCompleted: {
    textDecorationLine: "line-through",
    color: Colors.gray2,
  },
  scheduleTime: {
    fontSize: 13,
    color: Colors.gray1,
  },
  summaryCard: {
    backgroundColor: Colors.white1,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white2,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTextContainer: {
    alignItems: "flex-start",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black2,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.gray1,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.gray3,
  },
  medicineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medicineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 13,
    color: Colors.gray1,
  },
  emptyMedicineContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.white1,
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyMedicineText: {
    fontSize: 14,
    color: Colors.gray2,
    marginTop: 12,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray3,
    gap: 6,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray1,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.white1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: Colors.gray1,
    textAlign: "center",
  },
  fullWidthActionCard: {
    backgroundColor: Colors.white1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthActionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fullWidthActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidthActionText: {
    flex: 1,
  },
  fullWidthActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black2,
    marginBottom: 4,
  },
  fullWidthActionDescription: {
    fontSize: 13,
    color: Colors.gray1,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default MainScreen;
