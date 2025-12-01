import MyMedicinesAnalysisScreen from "@/screens/MyMedicinesAnalysisScreen";
import { useLocalSearchParams } from "expo-router";

export default function MyMedicinesAnalysis() {
  const { newMedicineData, scanData } = useLocalSearchParams<{
    newMedicineData?: string;
    scanData?: string;
  }>();

  return (
    <MyMedicinesAnalysisScreen
      newMedicineDataStr={newMedicineData}
      scanDataStr={scanData}
    />
  );
}
