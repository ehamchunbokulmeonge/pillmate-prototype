import AddMedicineReminderScreen from "@/screens/AddMedicineReminderScreen";
import { useLocalSearchParams } from "expo-router";

export default function AddMedicineReminder() {
  const { medicineName, medicineIngredient, medicineAmount, scanData } =
    useLocalSearchParams<{
      medicineName?: string;
      medicineIngredient?: string;
      medicineAmount?: string;
      scanData?: string;
    }>();

  return (
    <AddMedicineReminderScreen
      medicineName={medicineName}
      medicineIngredient={medicineIngredient}
      medicineAmount={medicineAmount}
      scanData={scanData}
    />
  );
}
