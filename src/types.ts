export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  isQuickResponse?: boolean;
}

export interface HealthTip {
  category: string;
  tip: string;
  author: string;
}

export interface LabResultRow {
  testName: string;
  result: string;
  referenceRange: string;
  status: 'Normal' | 'Low' | 'High' | 'Critical' | 'Unknown';
  explanation?: string;
}

export interface MedicalReportAnalysis {
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
    date?: string;
  };
  results: LabResultRow[];
  summary: string;
  lifestyleRecommendations: string[];
  nutritionRecommendations: string[];
  warningSigns: string[];
}

export interface MealItem {
  mealName: string; // "Breakfast", "Lunch", "Dinner", "Snacks"
  description: string;
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  fiber: number; // in g
}

export interface NutritionPlan {
  dailyCalorieTarget: number;
  waterIntakeLiters: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: MealItem[];
  tips: string[];
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string; // e.g., "12-15" or "Hold 30s"
  duration?: string; // e.g., "5 mins" or "N/A"
  restPeriod: string; // e.g., "60s"
  description: string;
}

export interface DayWorkout {
  day: string; // e.g., "Day 1 - Chest & Triceps"
  focus: string;
  exercises: WorkoutExercise[];
}

export interface FitnessPlan {
  goal: string;
  dailyCalorieTarget: number;
  weeklySchedule: DayWorkout[];
  recoveryTips: string[];
}

export interface MedicineDetails {
  name: string;
  category: string;
  purpose: string;
  commonUses: string[];
  sideEffects: string[];
  precautions: string[];
  drugInteractions: string[];
  dosageWarning: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: 'Daily' | 'Weekly' | 'Specific Days' | 'As Needed';
  times: string[]; // array of strings in "HH:MM" format
  specificDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  category: string; // e.g. "Tablet", "Capsule", "Liquids", "Inhaler", "Injection", "Drops", "Other"
  notes?: string;
  color: string;    // e.g. "teal", "blue", "indigo", "rose", "amber", "emerald"
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // "HH:MM"
  takenAt: string;       // ISO string
  date: string;          // "YYYY-MM-DD"
  status: 'Taken' | 'Skipped' | 'Missed';
}

