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
import { api } from "../services/api";

interface TodaySchedule {
  id: number;
  medicine_id: number;
  medicine_name: string;
  dose_count: number;
  dose_time: string;
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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <Text style={styles.titleText}>오늘 복용할 약</Text>
        </View>

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
            {schedules.map((schedule, index) => {
              const isActive = selectedScheduleId === schedule.id;
              const isExpanded = isActive && selectedDetail;

              return (
                <View key={schedule.id} style={styles.timelineItem}>
                  {/* Timeline Marker */}
                  <View style={styles.timelineMarker}>
                    {/* 연속 타임라인 선 */}
                    {index < schedules.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isExpanded && styles.timelineLineExpanded,
                        ]}
                      >
                        <Svg
                          width="2"
                          height="100%"
                          style={{ position: "absolute" }}
                        >
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
                    )}

                    <Svg width="25" height="25" style={styles.circleSvg}>
                      {isActive ? (
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
                        <Text style={styles.medicineName}>
                          {schedule.medicine_name}
                        </Text>
                        <Text style={styles.medicineTime}>
                          {formatTime(schedule.dose_time)}
                        </Text>
                      </View>
                      <Text style={styles.medicineDosage}>
                        {schedule.dose_count}정 복용
                      </Text>

                      {/* 확장된 상세 정보 */}
                      {isExpanded && selectedDetail && (
                        <View style={styles.detailContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>시작일</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedDetail.start_date)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>종료일</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedDetail.end_date)}
                            </Text>
                          </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 18,
    color: "#5D5D5D",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#000000",
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
  timelineLine: {
    position: "absolute",
    left: 18,
    top: 20.5,
    width: 2,
    height: 56,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  timelineLineExpanded: {
    height: 149,
  },
  medicineCard: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    borderRadius: 10,
    padding: 14,
    marginLeft: 16,
    marginBottom: 15,
    minHeight: 61,
  },
  medicineCardActive: {
    minHeight: 154,
  },
  medicineContent: {
    gap: 2,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  medicineTime: {
    fontSize: 14,
    color: "#9B9B9B",
  },
  medicineDosage: {
    fontSize: 12,
    color: "#9B9B9B",
  },
  detailContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D5D5D",
  },
  detailValue: {
    fontSize: 13,
    color: "#000000",
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
