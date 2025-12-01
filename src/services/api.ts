import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  "https://cottage-sentence-assign-abc.trycloudflare.com";

export const api = {
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
};
