import AddMedicineReminderScreen from "@/screens/AddMedicineReminderScreen";
import { useLocalSearchParams } from "expo-router";

export default function AddMedicineReminder() {
  const {
    medicineId,
    medicineName,
    medicineIngredient,
    medicineAmount,
    scanData,
  } = useLocalSearchParams<{
    medicineId?: string;
    medicineName?: string;
    medicineIngredient?: string;
    medicineAmount?: string;
    scanData?: string;
  }>();

  return (
    <AddMedicineReminderScreen
      medicineId={medicineId}
      medicineName={medicineName}
      medicineIngredient={medicineIngredient}
      medicineAmount={medicineAmount}
      scanData={scanData}
    />
  );
}
