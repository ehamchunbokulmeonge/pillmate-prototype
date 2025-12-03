import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Colors } from "../constants/Color";
import { api } from "../services/api";

interface TodaySchedule {
  id: number;
  medicine_id: number;
  medicine_name: string;
  dose_count: number;
  dose_time: string;
  is_completed?: boolean;
}

interface ScheduleDetail {
  medicine_id: number;
  medicine_name: string;
  dose_count: number;
  dose_time: string;
  start_date: string;
  end_date: string;
  id: number;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ScheduleScreen = () => {
  const [schedules, setSchedules] = useState<TodaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [selectedDetail, setSelectedDetail] = useState<ScheduleDetail | null>(
    null
  );
  const [completedSchedules, setCompletedSchedules] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchTodaySchedules();
  }, []);

  const fetchTodaySchedules = async () => {
    try {
      setLoading(true);
      const data = await api.getTodaySchedules();

      // 시간 순서대로 정렬 (오름차순)
      const sortedData = data.sort((a, b) => {
        // "HH:MM:SS" 형식 비교
        return a.dose_time.localeCompare(b.dose_time);
      });

      setSchedules(sortedData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePress = async (scheduleId: number) => {
    try {
      if (selectedScheduleId === scheduleId) {
        // 이미 선택된 항목을 다시 클릭하면 닫기
        setSelectedScheduleId(null);
        setSelectedDetail(null);
      } else {
        // 새로운 항목 클릭 시 상세 정보 가져오기
        const detail = await api.getScheduleDetail(scheduleId);
        setSelectedScheduleId(scheduleId);
        setSelectedDetail(detail);
      }
    } catch (error) {
      console.error("Error fetching schedule detail:", error);
    }
  };

  const handleCompleteSchedule = (scheduleId: number) => {
    setCompletedSchedules((prev) => new Set(prev).add(scheduleId));
    // 선택 해제
    setSelectedScheduleId(null);
    setSelectedDetail(null);
  };

  const formatTime = (timeString: string) => {
    // dose_time이 "HH:MM:SS" 형식인 경우
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      return `${hours}:${minutes}`;
    }
    // ISO 형식인 경우 (이전 데이터 호환)
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${month}월 ${day}일`;
  };

  const completedCount = completedSchedules.size;
  const totalCount = schedules.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={24} color="#FF4242" />
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <Text style={styles.titleText}>오늘 복용할 약</Text>
        </View>

        {/* Progress Card */}
        {!loading && schedules.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.second}
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>복용 진행률</Text>
                  <Text style={styles.progressCount}>
                    {completedCount}/{totalCount}회 완료
                  </Text>
                </View>
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4242" />
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>복용 중인 약이 없습니다</Text>
          </View>
        ) : (
          /* Timeline */
          <View style={styles.timelineContainer}>
            {/* 전체 타임라인 선 */}
            <View style={styles.fullTimelineLine}>
              <Svg width="2" height="100%" style={{ position: "absolute" }}>
                <Line
                  x1="0.75"
                  y1="0"
                  x2="0.75"
                  y2="100%"
                  stroke="#FF4242"
                  strokeWidth="1.5"
                />
              </Svg>
            </View>

            {schedules.map((schedule, index) => {
              const isActive = selectedScheduleId === schedule.id;
              const isExpanded = isActive && selectedDetail;
              const isCompleted = completedSchedules.has(schedule.id);

              return (
                <View key={schedule.id} style={styles.timelineItem}>
                  {/* Timeline Marker */}
                  <View style={styles.timelineMarker}>
                    <Svg width="25" height="25" style={styles.circleSvg}>
                      {isCompleted ? (
                        <>
                          <Circle
                            cx="12.5"
                            cy="12.5"
                            r="11.5"
                            fill={Colors.second}
                            stroke={Colors.second}
                            strokeWidth="2"
                          />
                          <Circle cx="12.5" cy="12.5" r="6.5" fill="white" />
                        </>
                      ) : isActive ? (
                        <>
                          <Circle
                            cx="12.5"
                            cy="12.5"
                            r="11.5"
                            fill="white"
                            stroke="#FF4242"
                            strokeWidth="2"
                          />
                          <Circle cx="12.5" cy="12.5" r="6.5" fill="#FF4242" />
                        </>
                      ) : (
                        <Circle
                          cx="12.5"
                          cy="12.5"
                          r="6.5"
                          fill="white"
                          stroke="#FF4242"
                          strokeWidth="2"
                        />
                      )}
                    </Svg>
                  </View>

                  {/* Medicine Card */}
                  <TouchableOpacity
                    style={[
                      styles.medicineCard,
                      isExpanded && styles.medicineCardActive,
                    ]}
                    onPress={() => handleSchedulePress(schedule.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.medicineContent}>
                      <View style={styles.medicineHeader}>
                        <View style={styles.medicineNameContainer}>
                          <Ionicons name="medical" size={18} color="#FF4242" />
                          <Text style={styles.medicineName}>
                            {schedule.medicine_name}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="#9B9B9B"
                          />
                          <Text style={styles.medicineTime}>
                            {formatTime(schedule.dose_time)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.dosageContainer}>
                        <Ionicons
                          name="water-outline"
                          size={14}
                          color="#9B9B9B"
                        />
                        <Text style={styles.medicineDosage}>
                          {schedule.dose_count}정 복용
                        </Text>
                      </View>

                      {/* 확장된 상세 정보 */}
                      {isExpanded && selectedDetail && (
                        <View style={styles.detailContainer}>
                          <View style={styles.detailRow}>
                            <View style={styles.detailLabelContainer}>
                              <Ionicons
                                name="play-circle-outline"
                                size={16}
                                color="#5D5D5D"
                              />
                              <Text style={styles.detailLabel}>시작일</Text>
                            </View>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedDetail.start_date)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <View style={styles.detailLabelContainer}>
                              <Ionicons
                                name="stop-circle-outline"
                                size={16}
                                color="#5D5D5D"
                              />
                              <Text style={styles.detailLabel}>종료일</Text>
                            </View>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedDetail.end_date)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => handleCompleteSchedule(schedule.id)}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#FFFFFF"
                            />
                            <Text style={styles.completeButtonText}>
                              복용 완료
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5D5D5D",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#F8F9FD",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 66, 66, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTextContainer: {
    gap: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  progressCount: {
    fontSize: 13,
    color: "#9B9B9B",
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF4242",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.second,
    borderRadius: 4,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  filterButtonActive: {
    backgroundColor: "#FF6249",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9B9B9B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  timelineContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    position: "relative",
  },
  fullTimelineLine: {
    position: "absolute",
    left: 34,
    top: 0,
    height: "100%",
    width: 2,
    zIndex: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 0,
  },
  timelineMarker: {
    alignItems: "center",
    width: 38,
    position: "relative",
  },
  circleSvg: {
    marginTop: 8,
    zIndex: 10,
  },
  medicineCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginLeft: 16,
    marginBottom: 15,
    minHeight: 80,
    borderWidth: 2,
    borderColor: "rgba(255, 66, 66, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  medicineCardActive: {
    minHeight: 220,
    borderColor: "#FF4242",
    backgroundColor: "#FFFAFA",
  },
  medicineContent: {
    gap: 8,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicineNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  medicineName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 66, 66, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  medicineTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4242",
  },
  dosageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  medicineDosage: {
    fontSize: 14,
    color: "#5D5D5D",
  },
  detailContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 66, 66, 0.1)",
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5D5D5D",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: Colors.second,
    borderRadius: 12,
    shadowColor: Colors.second,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9B9B9B",
  },
});

export default ScheduleScreen;
