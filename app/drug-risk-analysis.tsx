import { useLocalSearchParams } from "expo-router";
import React from "react";
import DrugRiskAnalysisScreen from "../src/screens/DrugRiskAnalysisScreen";

export default function DrugRiskAnalysisRoute() {
  const params = useLocalSearchParams();

  console.log("=== DrugRiskAnalysisRoute 렌더링 ===");
  console.log("Received params:", params);
  console.log("params.data type:", typeof params.data);
  console.log("params.data:", params.data);

  const data = params.data ? JSON.parse(params.data as string) : null;
  const medicineId = params.medicineId as string | undefined;
  console.log("Parsed data:", JSON.stringify(data, null, 2));
  console.log("MedicineId:", medicineId);

  return <DrugRiskAnalysisScreen data={data} medicineId={medicineId} />;
}
