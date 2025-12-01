import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl;

export interface Medicine {
  id: string;
  name: string;
  ingredient: string;
  amount: string;
  times?: string[];
  count?: number;
  duration?: number;
}

export interface AnalysisData {
  overallRiskScore: number;
  riskLevel: "high" | "medium" | "low";
  riskItems: any[];
  warnings: string[];
  summary: string;
  sections: any[];
}

export const api = {
  // 지병 정보 전송
  async submitMedicalConditions(conditions: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/medical-conditions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conditions),
      }
    );

    if (!response.ok) {
      throw new Error("지병 정보 전송에 실패했습니다.");
    }

    return response.json();
  },

  // 저장된 약물 목록 조회
  async getMedicines(): Promise<Medicine[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medicines/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("약물 목록 조회에 실패했습니다.");
    }

    return response.json();
  },

  // 약물 상세 조회
  async getMedicineDetail(medicineId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/medicines/${medicineId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("약물 상세 조회에 실패했습니다.");
    }

    return response.json();
  },

  // 새 약물 추가 시 분석 요청 (저장된 약물들과 함께 분석)
  async analyzeMedicineWithExisting(newMedicine: {
    name: string;
    ingredient: string;
    amount: string;
    times: string[];
    count: number;
    duration: number;
  }): Promise<{
    newMedicine: Medicine;
    existingMedicines: Medicine[];
    analysis: AnalysisData;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/medicines/analyze-with-existing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMedicine),
      }
    );

    if (!response.ok) {
      throw new Error("약물 분석에 실패했습니다.");
    }

    return response.json();
  },

  // 약물 추가
  async addMedicine(medicine: {
    name: string;
    ingredient: string;
    amount: string;
    times: string[];
    count: number;
    duration: number;
  }) {
    // API 스펙에 맞게 필요한 필드만 전송
    const medicineData = {
      name: medicine.name,
      ingredient: medicine.ingredient,
      amount: medicine.amount,
    };

    console.log("API 호출 - 약물 등록:", JSON.stringify(medicineData, null, 2));
    console.log("API URL:", `${API_BASE_URL}/api/v1/medicines/`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("타임아웃 발생 - 요청 취소");
        controller.abort();
      }, 30000); // 30초 타임아웃

      console.log("fetch 시작...");
      const response = await fetch(`${API_BASE_URL}/api/v1/medicines/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicineData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("fetch 완료, 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("약물 등록 실패 응답:", errorText);
        throw new Error(
          `약물 추가에 실패했습니다 (${response.status}): ${errorText}`
        );
      }

      console.log("응답 파싱 시작...");
      const result = await response.json();
      console.log("약물 등록 성공 응답:", result);
      return result;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error("요청 타임아웃:", error);
        throw new Error("서버 응답 시간이 초과되었습니다.");
      }
      console.error("약물 등록 에러:", error);
      throw error;
    }
  },

  // 스케줄 등록
  async addSchedule(schedule: {
    medicine_id: number;
    medicine_name: string;
    dose_count: number;
    dose_time: string;
    start_date: string;
    end_date: string;
  }) {
    console.log("API 호출 - 스케줄 등록:", JSON.stringify(schedule, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedule),
    });

    console.log("스케줄 등록 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("스케줄 등록 실패 응답:", errorText);
      throw new Error(
        `스케줄 등록에 실패했습니다 (${response.status}): ${errorText}`
      );
    }

    return response.json();
  },

  // 오늘의 스케줄 조회
  async getTodaySchedules(): Promise<
    Array<{
      id: number;
      medicine_id: number;
      medicine_name: string;
      dose_count: number;
      dose_time: string;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("스케줄 조회에 실패했습니다.");
    }

    return response.json();
  },

  // 스케줄 상세 조회
  async getScheduleDetail(scheduleId: number): Promise<{
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
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/schedules/${scheduleId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("스케줄 상세 조회에 실패했습니다.");
    }

    return response.json();
  },
};
