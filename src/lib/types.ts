export interface Baby {
  id: number;
  name: string;
  birth_date: string; // YYYY-MM-DD
  created_at?: string;
}

export type MealType = 'sarapan' | 'makan_siang' | 'makan_malam' | 'snack';

export interface FoodItem {
  name: string;
  quantity: string;
  estimated_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
}

export interface Meal {
  id: number;
  baby_id: number;
  date: string; // YYYY-MM-DD
  meal_time?: string; // HH:mm
  meal_type: MealType;
  input_text: string;
  foods: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_iron: number;
  total_calcium: number;
  created_at?: string;
}

export interface MedicationLog {
  id: number;
  baby_id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  dosage: string;
  notes?: string;
  created_at?: string;
}

export interface GrowthLog {
  id: number;
  baby_id: number;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  height?: number; // cm
  head_circ?: number; // cm
  notes?: string;
  created_at?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
}

export interface NutritionTarget {
  ageLabel: string;
  calories: number; // kkal
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  fiber: number;    // g
  iron: number;     // mg
  calcium: number;  // mg
}

export interface MenuRecommendation {
  title: string;
  description: string;
  nutrientsProvided: string[];
  estimatedCalories: number;
}

export interface AnalyzeResult {
  foods: FoodItem[];
  total: NutritionSummary;
  notes?: string;
}

export interface TBMedicationLog {
  id: number;
  baby_id: number;
  day_number: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  medicine_name: string;
  dosage: string;
  method: string;
  status: string; // 'Selesai' | 'Terlewat' | 'Sebagian' | 'Muntah' | '-'
  notes?: string;
  created_at?: string;
}

export interface TBMedicationStats {
  totalLoggedDays: number;
  completedDays: number;
  missedDays: number;
  targetDays: number;
  completionRate: number;
  streakDays: number;
  avgAbsorption: number;
  latestDay: number;
  todayLogged: boolean;
  todayLog?: TBMedicationLog;
}

export type ParentRole = 'ayah' | 'ibu';

export type ParentSpecialCondition =
  | 'none'
  | 'menyusui_eksklusif' // Ibu Menyusui Eksklusif 0-6 bulan (+450 kkal, hidrasi +3 gelas)
  | 'menyusui_lanjutan'  // Ibu Menyusui Lanjutan 6-24 bulan (+400 kkal, hidrasi +2 gelas)
  | 'hamil'              // Ibu Hamil (+300 kkal)
  | 'atlet_pekerja_keras' // Pekerja fisik berat / olahraga intens (+350 kkal)
  | 'hipertensi_asam_urat' // Fokus restriksi asam urat & kolesterol
  | 'lansia_pemulihan';   // Pemulihan pasca sakit

export interface ParentProfile {
  id: number;
  role: ParentRole;
  name: string;
  age: number;
  gender: 'pria' | 'wanita';
  weight: number; // kg
  height: number; // cm
  target_calories: number; // default calculated with Mifflin-St Jeor + Broca roadmap
  target_cholesterol_max: number; // max mg per day, default 200
  target_purine_max: number; // max mg per day, default 400
  target_fiber_min: number; // min g per day, default 25-30
  target_uric_acid_max: number; // target blood level, default 6.5 mg/dL (pria) / 5.5 mg/dL (wanita)
  target_cholesterol_lab_max: number; // target total blood cholesterol, default 190 mg/dL
  special_condition?: ParentSpecialCondition;
  notes?: string;
  created_at?: string;
}

export interface ParentFoodItem {
  name: string;
  quantity: string;
  estimated_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  cholesterol: number; // mg
  purine_mg: number; // mg
  purine_level: 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';
  saturated_fat: number; // g
}

export interface ParentMeal {
  id: number;
  parent_role: ParentRole;
  date: string; // YYYY-MM-DD
  meal_time?: string; // HH:mm
  meal_type: MealType;
  input_text: string;
  foods: ParentFoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_cholesterol: number; // mg
  total_purine: number; // mg
  health_warning?: string; // e.g. Warning for high purine / cholesterol
  created_at?: string;
}

export interface ParentLabCheck {
  id: number;
  parent_role: ParentRole;
  date: string; // YYYY-MM-DD
  uric_acid: number; // mg/dL
  total_cholesterol: number; // mg/dL
  ldl_cholesterol?: number; // mg/dL
  hdl_cholesterol?: number; // mg/dL
  triglycerides?: number; // mg/dL
  blood_pressure?: string; // e.g. "120/80"
  notes?: string;
  created_at?: string;
}

export interface ParentWaterLog {
  id: number;
  parent_role: ParentRole;
  date: string;
  glasses: number;
}

export interface ParentAnalyzeResult {
  foods: ParentFoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    cholesterol: number;
    purine_mg: number;
    saturated_fat: number;
  };
  health_evaluation: string;
  purine_status: 'aman' | 'waspada' | 'tinggi';
  cholesterol_status: 'aman' | 'waspada' | 'tinggi';
}

export interface ParentRecommendation {
  title: string;
  category: 'sarapan' | 'makan_siang' | 'makan_malam' | 'snack_sehat';
  description: string;
  benefits: string[];
  purine_level: string;
  cholesterol_level: string;
  estimated_calories: number;
}

export interface AITargetAssessment {
  role: ParentRole;
  labDate: string | null;
  hasLabData: boolean;
  uricAcid: number | null;
  uricAcidStatus: 'normal' | 'waspada' | 'tinggi';
  totalCholesterol: number | null;
  cholesterolStatus: 'normal' | 'waspada' | 'tinggi';
  adjusted_purine_max: number;
  adjusted_cholesterol_max: number;
  adjusted_fiber_min: number;
  adjusted_water_glasses: number;
  phase: 'pemulihan_ketat' | 'pencegahan_waspada' | 'pemeliharaan_normal';
  title: string;
  summary: string;
  directives: string[];
  recommendations: string[];
}

export interface MetricEstimation {
  baseline: number;
  estimated: number;
  diff: number;
  change_pct: number;
  trend: 'turun' | 'naik' | 'stabil';
  status: 'normal' | 'waspada' | 'tinggi';
  reason: string;
}

export interface ParentDailyHealthEstimation {
  uric_acid: MetricEstimation;
  cholesterol: MetricEstimation;
  hasLabBaseline: boolean;
  baselineDate?: string;
  advice: string;
}

export interface ParentIdealNutrition {
  bmi: number;
  bmiCategory: 'kurus' | 'ideal' | 'kelebihan' | 'obesitas';
  bmiCategoryLabel: string;
  idealWeightBroca: number;
  idealWeightRange: { min: number; max: number };
  weightDifference: number;
  bmr: number;
  tdeeMaintenance: number;
  targetCalories: number;
  calorieAdjustment: number;
  conditionCaloriesBonus?: number;
  conditionWaterBonusGlasses?: number;
  conditionAdjustmentLabel?: string;
  calorieStrategy: string;
  explanation: string;
}





