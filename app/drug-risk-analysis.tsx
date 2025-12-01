import { useLocalSearchParams } from "expo-router";
import DrugRiskAnalysisScreen from "../src/screens/DrugRiskAnalysisScreen";

export default function DrugRiskAnalysisRoute() {
  const params = useLocalSearchParams();

  // URL params에서 데이터 파싱
  const data = params.data ? JSON.parse(params.data as string) : undefined;

  return <DrugRiskAnalysisScreen {...data} />;
}
