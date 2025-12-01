import Arrow1Svg from "@/assets/icons/arrow1.svg";
import HardDrivesSvg from "@/assets/icons/HardDrives.svg";
import PlusSvg from "@/assets/icons/plus.svg";
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
  medicineName?: string;
  medicineIngredient?: string;
  medicineAmount?: string;
  scanData?: string;
}

const AddMedicineReminderScreen = ({
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
      // 1. 약물 추가
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

      // 2. 시작 날짜와 종료 날짜 계산
      const today = new Date();
      const startDate = today.toISOString();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + duration);
      const endDateStr = endDate.toISOString();

      // 3. 각 복용 시간마다 스케줄 등록
      for (const time of times) {
        const scheduleData = {
          medicine_id: addedMedicine.id,
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
          {/* 약 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>약 이름</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="약 이름을 입력하세요"
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
              <Text style={styles.label}>약 개수</Text>
              <TouchableOpacity
                style={styles.counterContainer}
                onPress={() => setShowCountPicker(true)}
              >
                <View style={styles.counterContent}>
                  <Text style={styles.counterValue}>{count}</Text>
                  <Text style={styles.counterUnit}>개</Text>
                </View>
                <Arrow1Svg width={10} height={10} />
              </TouchableOpacity>
            </View>

            {/* 복용 기간 */}
            <View style={styles.halfSection}>
              <Text style={styles.label}>복용 기간</Text>
              <TouchableOpacity
                style={styles.counterContainer}
                onPress={() => setShowDurationPicker(true)}
              >
                <View style={styles.counterContent}>
                  <Text style={styles.counterValue}>{duration}</Text>
                  <Text style={styles.counterUnit}>일</Text>
                </View>
                <Arrow1Svg width={10} height={10} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 시간 */}
          <View style={styles.section}>
            <Text style={styles.label}>시간</Text>
            {times.map((time, index) => (
              <View key={index} style={styles.timeContainer}>
                <RingSvg width={25} height={28} />
                <TouchableOpacity onPress={() => handleTimePress(index)}>
                  <Text style={styles.timeText}>{time}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={() => handleAddTimeButton(index)}
                >
                  <PlusSvg width={14} height={14} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 시간 추가하기 버튼 */}
          <TouchableOpacity
            style={styles.addTimeTextButton}
            onPress={handleAddTime}
          >
            <Text style={styles.addTimeTextButtonText}>시간 추가</Text>
          </TouchableOpacity>
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
    gap: 15,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black2,
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
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.white1,
    borderWidth: 1,
    borderColor: "#CFCFCF",
  },
  counterContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 127,
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
    height: 80,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: "rgba(255, 66, 66, 0.1)",
  },
  timeText: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.black2,
  },
  addTimeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "rgba(255, 66, 66, 0.4)",
  },
  addTimeTextButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.white1,
    borderWidth: 1,
    borderColor: "rgba(255, 98, 73, 0.3)",
    marginBottom: 8,
  },
  addTimeTextButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black2,
  },
  registerButton: {
    height: 60,
    marginHorizontal: 16,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.second,
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
