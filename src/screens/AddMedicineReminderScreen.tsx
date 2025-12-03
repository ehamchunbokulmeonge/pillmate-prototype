import HardDrivesSvg from "@/assets/icons/HardDrives.svg";
import RingSvg from "@/assets/icons/ring.svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Color";
import { api } from "../services/api";

interface AddMedicineReminderScreenProps {
  medicineId?: string;
  medicineName?: string;
  medicineIngredient?: string;
  medicineAmount?: string;
  scanData?: string;
}

const AddMedicineReminderScreen = ({
  medicineId,
  medicineName = "",
  medicineIngredient = "",
  medicineAmount = "",
  scanData,
}: AddMedicineReminderScreenProps) => {
  const router = useRouter();
  const [name, setName] = useState(medicineName);
  const [ingredient] = useState(medicineIngredient);
  const [amount] = useState(medicineAmount);
  const [count, setCount] = useState(1);
  const [duration, setDuration] = useState(3);
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTime = () => {
    setTimes([...times, "08:00"]);
  };

  const handleTimePress = (index: number) => {
    const [hours, minutes] = times[index].split(":").map(Number);
    setTempHour(hours);
    setTempMinute(minutes);
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    const hours = tempHour.toString().padStart(2, "0");
    const minutes = tempMinute.toString().padStart(2, "0");
    const newTimes = [...times];
    newTimes[selectedTimeIndex] = `${hours}:${minutes}`;
    setTimes(newTimes);
    setShowTimePicker(false);
  };

  const handleAddTimeButton = (index: number) => {
    setTimes([...times, "08:00"]);
  };

  const handleRegister = async () => {
    console.log("===== 등록 버튼 클릭됨 =====");
    console.log("isSubmitting:", isSubmitting);

    if (isSubmitting) {
      console.log("이미 등록 중입니다.");
      return;
    }

    setIsSubmitting(true);
    console.log("등록 프로세스 시작");

    try {
      let medicineIdToUse: number;

      // 1. 약물 추가 (medicineId가 없을 때만)
      if (medicineId) {
        console.log("이미 등록된 약물 ID 사용:", medicineId);
        medicineIdToUse = parseInt(medicineId, 10);
      } else {
        const medicineData = {
          name,
          ingredient,
          amount,
          times,
          count,
          duration,
        };

        console.log("약물 등록 중:", medicineData);
        const addedMedicine = await api.addMedicine(medicineData);
        console.log("약물 등록 완료:", addedMedicine);
        medicineIdToUse = addedMedicine.id;
      }

      // 2. 시작 날짜와 종료 날짜 계산
      const today = new Date();
      const startDate = today.toISOString();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + duration);
      const endDateStr = endDate.toISOString();

      // 3. 각 복용 시간마다 스케줄 등록
      for (const time of times) {
        const scheduleData = {
          medicine_id: medicineIdToUse,
          medicine_name: name,
          dose_count: count,
          dose_time: `${time}:00`, // "HH:MM:SS" 형식으로 변환
          start_date: startDate,
          end_date: endDateStr,
        };

        console.log("스케줄 등록 중:", scheduleData);
        console.log(
          "스케줄 데이터 상세:",
          JSON.stringify(scheduleData, null, 2)
        );

        try {
          await api.addSchedule(scheduleData);
          console.log("스케줄 등록 성공:", time);
        } catch (scheduleError) {
          console.error("스케줄 등록 실패:", time, scheduleError);
          throw new Error(
            `${time} 스케줄 등록 실패: ${
              scheduleError instanceof Error
                ? scheduleError.message
                : "알 수 없는 오류"
            }`
          );
        }
      }

      console.log("모든 등록 완료");
      Alert.alert("성공", "약과 복용 일정이 등록되었습니다.", [
        { text: "확인", onPress: () => router.push("/") },
      ]);
    } catch (error) {
      console.error("등록 실패:", error);
      Alert.alert(
        "오류",
        error instanceof Error
          ? error.message
          : "약 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#343330" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>복용 알림 추가</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* 안내 카드 */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="information-circle"
                size={24}
                color={Colors.second}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>복용 알림 설정</Text>
              <Text style={styles.infoDescription}>
                약 정보와 복용 시간을 입력하면{"\n"}
                정해진 시간에 알림을 받을 수 있어요
              </Text>
            </View>
          </View>

          {/* 약 이름 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Ionicons name="medical" size={20} color={Colors.second} />
              <Text style={styles.label}>약 이름</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="약 이름을 입력하세요"
                placeholderTextColor={Colors.gray3}
              />
              <View style={styles.iconContainer}>
                <HardDrivesSvg width={32} height={32} />
              </View>
            </View>
          </View>

          {/* 약 개수와 복용 기간 */}
          <View style={styles.row}>
            {/* 약 개수 */}
            <View style={styles.halfSection}>
              <View style={styles.labelContainer}>
                <Ionicons name="analytics" size={18} color={Colors.second} />
                <Text style={styles.label}>약 개수</Text>
              </View>
              <TouchableOpacity
                style={styles.counterContainer}
                onPress={() => setShowCountPicker(true)}
              >
                <View style={styles.counterIconWrapper}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={28}
                    color={Colors.gray3}
                  />
                </View>
                <View style={styles.counterContent}>
                  <Text style={styles.counterValue}>{count}</Text>
                  <Text style={styles.counterUnit}>개</Text>
                </View>
                <View style={styles.counterIconWrapper}>
                  <Ionicons
                    name="add-circle-outline"
                    size={28}
                    color={Colors.second}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* 복용 기간 */}
            <View style={styles.halfSection}>
              <View style={styles.labelContainer}>
                <Ionicons name="calendar" size={18} color={Colors.second} />
                <Text style={styles.label}>복용 기간</Text>
              </View>
              <TouchableOpacity
                style={styles.counterContainer}
                onPress={() => setShowDurationPicker(true)}
              >
                <View style={styles.counterIconWrapper}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={28}
                    color={Colors.gray3}
                  />
                </View>
                <View style={styles.counterContent}>
                  <Text style={styles.counterValue}>{duration}</Text>
                  <Text style={styles.counterUnit}>일</Text>
                </View>
                <View style={styles.counterIconWrapper}>
                  <Ionicons
                    name="add-circle-outline"
                    size={28}
                    color={Colors.second}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 시간 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Ionicons name="alarm" size={20} color={Colors.second} />
              <Text style={styles.label}>복용 시간</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{times.length}회</Text>
              </View>
            </View>
            {times.map((time, index) => (
              <View key={index} style={styles.timeContainer}>
                <View style={styles.timeLeftSection}>
                  <View style={styles.timeIconContainer}>
                    <RingSvg width={25} height={28} />
                  </View>
                  <View style={styles.timeInfoContainer}>
                    <Text style={styles.timeLabel}>{index + 1}회차</Text>
                    <TouchableOpacity
                      style={styles.timeValueContainer}
                      onPress={() => handleTimePress(index)}
                    >
                      <Text style={styles.timeText}>{time}</Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={Colors.gray2}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {times.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => {
                      const newTimes = times.filter((_, i) => i !== index);
                      setTimes(newTimes);
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* 시간 추가하기 버튼 */}
          <TouchableOpacity
            style={styles.addTimeTextButton}
            onPress={handleAddTime}
          >
            <Ionicons name="add-circle" size={20} color={Colors.second} />
            <Text style={styles.addTimeTextButtonText}>복용 시간 추가</Text>
          </TouchableOpacity>

          {/* 요약 카드 */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>등록 요약</Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>약물명</Text>
              <Text style={styles.summaryValue}>{name || "미입력"}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>1회 복용량</Text>
              <Text style={styles.summaryValue}>{count}개</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>하루 복용 횟수</Text>
              <Text style={styles.summaryValue}>{times.length}회</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>복용 기간</Text>
              <Text style={styles.summaryValue}>{duration}일</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 등록하기 버튼 */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        <Text style={styles.registerButtonText}>
          {isSubmitting ? "등록 중..." : "등록하기"}
        </Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>시간 선택</Text>
                <TouchableOpacity onPress={handleTimeConfirm}>
                  <Text style={styles.modalButton}>완료</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePickerContainer}>
                <ScrollView style={styles.timePickerScroll}>
                  {[...Array(24)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.pickerItem}
                      onPress={() => setTempHour(i)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          tempHour === i && styles.pickerItemTextActive,
                        ]}
                      >
                        {i.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.timeSeparator}>:</Text>
                <ScrollView style={styles.timePickerScroll}>
                  {[...Array(60)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.pickerItem}
                      onPress={() => setTempMinute(i)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          tempMinute === i && styles.pickerItemTextActive,
                        ]}
                      >
                        {i.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Count Picker Modal */}
      {showCountPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCountPicker(false)}>
                  <Text style={styles.modalButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>약 개수</Text>
                <TouchableOpacity onPress={() => setShowCountPicker(false)}>
                  <Text style={styles.modalButton}>완료</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {[...Array(20)].map((_, i) => (
                  <TouchableOpacity
                    key={i + 1}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCount(i + 1);
                      setShowCountPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        count === i + 1 && styles.pickerItemTextActive,
                      ]}
                    >
                      {i + 1}개
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Duration Picker Modal */}
      {showDurationPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>복용 기간</Text>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>완료</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {[...Array(30)].map((_, i) => (
                  <TouchableOpacity
                    key={i + 1}
                    style={styles.pickerItem}
                    onPress={() => {
                      setDuration(i + 1);
                      setShowDurationPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        duration === i + 1 && styles.pickerItemTextActive,
                      ]}
                    >
                      {i + 1}일
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.white1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 98, 73, 0.08)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 98, 73, 0.2)",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black2,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.gray1,
  },
  section: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black2,
  },
  timeBadge: {
    backgroundColor: Colors.second,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white1,
  },
  inputContainer: {
    flexDirection: "row",
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.white1,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black2,
  },
  iconContainer: {
    width: 65,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 66, 66, 0.2)",
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfSection: {
    width: "48%",
    gap: 8,
  },
  counterContainer: {
    flexDirection: "row",
    height: 70,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white1,
    borderWidth: 2,
    borderColor: "rgba(255, 98, 73, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  counterIconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  counterContent: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black2,
  },
  counterUnit: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white1,
    borderWidth: 2,
    borderColor: "rgba(255, 98, 73, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 98, 73, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeInfoContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray1,
    marginBottom: 4,
  },
  timeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black2,
  },
  removeTimeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  addTimeTextButton: {
    flexDirection: "row",
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.second,
    gap: 8,
  },
  addTimeTextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.second,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 98, 73, 0.05)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 98, 73, 0.15)",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black2,
    marginBottom: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255, 98, 73, 0.15)",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black2,
  },
  registerButton: {
    height: 60,
    marginHorizontal: 16,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.second,
    shadowColor: Colors.second,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black2,
  },
  modalButton: {
    fontSize: 16,
    color: Colors.second,
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerItemText: {
    fontSize: 18,
    color: Colors.gray2,
  },
  pickerItemTextActive: {
    color: Colors.second,
    fontWeight: "700",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  timePickerScroll: {
    maxHeight: 200,
    width: 80,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black2,
    marginHorizontal: 10,
  },
});

export default AddMedicineReminderScreen;
