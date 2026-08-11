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
