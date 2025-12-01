import MoonSvg from "@/assets/icons/Moon.svg";
import SunSvg from "@/assets/icons/Sun.svg";
import SunHorizonSvg from "@/assets/icons/SunHorizon.svg";
import VectorSvg from "@/assets/icons/Vector.svg";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import styled from "styled-components/native";
import { api } from "../services/api";

const TitleSection = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: 600;
  color: #000;
`;

const TimeFilterContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const TimeFilterButton = styled.TouchableOpacity<{ isActive: boolean }>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 20px;
  background-color: ${(props) => (props.isActive ? "#ff6249" : "#f5f5f5")};
`;

const TimeFilterText = styled.Text<{ isActive: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.isActive ? "#fff" : "#9b9b9b")};
`;

const ContentArea = styled.View`
  flex: 1;
  background-color: #f5f5f5;
  padding: 16px;
`;

const MedicineCard = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 15px 17px;
  border-width: 1px;
  border-color: #cfcfcf;
  margin-bottom: 16px;
`;

const MedicineName = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-bottom: 2px;
`;

const MedicineIngredient = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #3e3e3e;
`;

const MedicineInfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const TimeInfoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const TimeInfoLabel = styled.Text`
  font-size: 12px;
  color: #3e3e3e;
`;

const TimeTag = styled.View`
  padding: 1px 5px;
  border-radius: 6px;
  background-color: #f5f5f5;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const TimeTagText = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #9b9b9b;
`;

const DetailButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const DetailButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #ff4242;
`;

type TimeFilter = "morning" | "lunch" | "dinner";

interface Medicine {
  id: string;
  name: string;
  ingredient: string;
  times: string[]; // HH:MM 형식의 시간들
}

interface Schedule {
  id: number;
  medicine_id: number;
  medicine_name: string;
  dose_count: number;
  dose_time: string;
}

const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #9b9b9b;
`;

export default function MedicineScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("morning");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 약물과 스케줄 정보를 동시에 가져오기
      const [medicinesData, schedulesData] = await Promise.all([
        api.getMedicines(),
        api.getTodaySchedules(),
      ]);

      // 약물별로 스케줄 시간을 매핑
      const medicinesWithTimes: Medicine[] = (medicinesData as any[])
        .filter((med) => med.is_active)
        .map((med) => {
          // 해당 약물의 모든 스케줄 찾기
          const medSchedules = schedulesData.filter(
            (s) => s.medicine_id === med.id
          );

          // 스케줄의 시간을 HH:MM 형식으로 변환
          const times = medSchedules.map((s) => {
            // dose_time이 "HH:MM:SS" 형식인 경우
            if (s.dose_time.includes(":")) {
              const [hours, minutes] = s.dose_time.split(":");
              return `${hours}:${minutes}`;
            }
            // ISO 형식인 경우 (이전 데이터 호환)
            const date = new Date(s.dose_time);
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          });

          return {
            id: med.id.toString(),
            name: med.name,
            ingredient: med.ingredient,
            times: times.length > 0 ? times : [],
          };
        });

      setMedicines(medicinesWithTimes);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // 시간을 시간대로 분류하는 함수
  const getTimeCategory = (time: string): TimeFilter => {
    const hour = parseInt(time.split(":")[0], 10);

    if (hour >= 6 && hour < 12) {
      return "morning"; // 6시~12시: 아침
    } else if (hour >= 12 && hour < 18) {
      return "lunch"; // 12시~18시: 점심
    } else {
      return "dinner"; // 18시~6시: 저녁
    }
  };

  // 필터링된 약물 목록
  const filteredMedicines = medicines.filter((medicine) => {
    // 해당 약물의 시간 중 선택된 시간대에 해당하는 것이 있는지 확인
    return medicine.times.some(
      (time) => getTimeCategory(time) === activeFilter
    );
  });

  const handleDetailPress = (medicineId: string) => {
    router.push({
      pathname: "/drug-risk-analysis",
      params: {
        medicineId,
      },
    });
  };

  return (
    <Container>
      <TitleSection>
        <Title>복용 중인 약</Title>
      </TitleSection>

      <TimeFilterContainer>
        <TimeFilterButton
          isActive={activeFilter === "morning"}
          onPress={() => setActiveFilter("morning")}
        >
          <SunHorizonSvg width={16} height={16} />
          <TimeFilterText isActive={activeFilter === "morning"}>
            아침
          </TimeFilterText>
        </TimeFilterButton>

        <TimeFilterButton
          isActive={activeFilter === "lunch"}
          onPress={() => setActiveFilter("lunch")}
        >
          <SunSvg width={16} height={16} />
          <TimeFilterText isActive={activeFilter === "lunch"}>
            점심
          </TimeFilterText>
        </TimeFilterButton>

        <TimeFilterButton
          isActive={activeFilter === "dinner"}
          onPress={() => setActiveFilter("dinner")}
        >
          <MoonSvg width={16} height={16} />
          <TimeFilterText isActive={activeFilter === "dinner"}>
            저녁
          </TimeFilterText>
        </TimeFilterButton>
      </TimeFilterContainer>

      <ScrollView>
        <ContentArea>
          {loading ? (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#FF4242" />
            </LoadingContainer>
          ) : filteredMedicines.length === 0 ? (
            <EmptyContainer>
              <EmptyText>
                {activeFilter === "morning"
                  ? "아침"
                  : activeFilter === "lunch"
                  ? "점심"
                  : "저녁"}
                에 복용할 약이 없습니다
              </EmptyText>
            </EmptyContainer>
          ) : (
            filteredMedicines.map((medicine) => {
              // 선택된 시간대에 해당하는 시간만 필터링
              const filteredTimes = medicine.times.filter(
                (time) => getTimeCategory(time) === activeFilter
              );

              return (
                <MedicineCard key={medicine.id}>
                  <MedicineName>{medicine.name}</MedicineName>
                  <MedicineIngredient>{medicine.ingredient}</MedicineIngredient>

                  <MedicineInfoRow>
                    <TimeInfoContainer>
                      <TimeInfoLabel>복용 시간:</TimeInfoLabel>
                      {filteredTimes.map((time, index) => (
                        <TimeTag key={`${time}-${index}`}>
                          <TimeTagText>{time}</TimeTagText>
                        </TimeTag>
                      ))}
                    </TimeInfoContainer>

                    <DetailButton
                      onPress={() => handleDetailPress(medicine.id)}
                    >
                      <DetailButtonText>자세히 보기</DetailButtonText>
                      <VectorSvg width={12} height={12} />
                    </DetailButton>
                  </MedicineInfoRow>
                </MedicineCard>
              );
            })
          )}
        </ContentArea>
      </ScrollView>
    </Container>
  );
}
