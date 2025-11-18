export interface Medication {
  id: string;
  name: string;
  ingredients: string[];
  imageUrl?: string;
  efficacy: string;
  dosage: string;
  sideEffects: string[];
  schedule: MedicationSchedule;
  riskLevel: 'safe' | 'caution' | 'danger';
  warning?: string;
  createdAt: Date;
}

export interface MedicationSchedule {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  timesPerDay: number;
  enableNotification: boolean;
  customTimes?: string[];
}

export interface OCRResult {
  recognizedText: string;
  medicationCandidates: MedicationCandidate[];
}

export interface MedicationCandidate {
  id: string;
  name: string;
  confidence: number;
  ingredients: string[];
}

export type FilterType = 'all' | 'danger' | 'morning' | 'afternoon' | 'evening' | 'ingredient';
export type SortType = 'name' | 'risk';
