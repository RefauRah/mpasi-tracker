import { NutritionTarget } from './types';

/**
 * Menghitung usia bayi dalam bulan berdasarkan tanggal lahir
 */
export function calculateAgeInMonths(birthDateStr: string): number {
  if (!birthDateStr) return 6;
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

/**
 * Memformat usia dalam string (misal: "8 Bulan", "1 Tahun 2 Bulan")
 */
export function formatAge(months: number): string {
  if (months < 1) return 'Kurang dari 1 bulan';
  if (months < 12) return `${months} Bulan`;
  
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} Tahun`;
  return `${years} Thn ${remMonths} Bln`;
}

/**
 * Mendapatkan target nutrisi harian berdasarkan usia bayi dalam bulan.
 * Mengacu pada Perkeni & Permenkes No 28 Tahun 2019 tentang Angka Kecukupan Gizi (AKG) RI
 * dan Panduan Porsi MPASI Kemenkes RI / WHO.
 */
export function getNutritionTarget(ageInMonths: number, mode: 'mpasi_only' | 'akg_total' = 'mpasi_only'): NutritionTarget {
  if (ageInMonths < 6) {
    return {
      ageLabel: '0-5 Bulan (ASI Eksklusif)',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      iron: 0,
      calcium: 0,
    };
  }

  if (mode === 'akg_total') {
    // Mode AKG Kemenkes RI 2019 Total Harian Keseluruhan (Termasuk ASI & Makanan)
    if (ageInMonths <= 11) {
      return {
        ageLabel: '6-11 Bulan (AKG Kemenkes Total Harian)',
        calories: 800,
        protein: 15,
        carbs: 105,
        fat: 35,
        fiber: 11,
        iron: 11,
        calcium: 270,
      };
    } else {
      // 12-23 Bulan (1-3 Tahun AKG Kemenkes)
      return {
        ageLabel: '12-23 Bulan (AKG Kemenkes Total Harian)',
        calories: 1350,
        protein: 20,
        carbs: 215,
        fat: 45,
        fiber: 19,
        iron: 7,
        calcium: 650,
      };
    }
  }

  // Mode Default: Target Khusus Dari Makanan Pendamping (MPASI Saja)
  // Sisa kalori & makronutrisi lainnya diasumsikan dipenuhi dari ASI/Susu (~400 kkal)
  if (ageInMonths <= 8) {
    return {
      ageLabel: '6-8 Bulan (Target Khusus MPASI)',
      calories: 200,
      protein: 7,
      carbs: 25,
      fat: 9,
      fiber: 3,
      iron: 10, // Kebutuhan zat besi MPASI tetap tinggi karena ASI rendah zat besi
      calcium: 200,
    };
  } else if (ageInMonths <= 11) {
    return {
      ageLabel: '9-11 Bulan (Target Khusus MPASI)',
      calories: 300,
      protein: 10,
      carbs: 38,
      fat: 13,
      fiber: 4,
      iron: 10,
      calcium: 220,
    };
  } else {
    // 12-23 Bulan
    return {
      ageLabel: '12-23 Bulan (Target Makanan Keluarga)',
      calories: 550,
      protein: 15,
      carbs: 75,
      fat: 20,
      fiber: 8,
      iron: 7,
      calcium: 400,
    };
  }
}

/**
 * Menghitung BMI Asia-Pasifik, Berat Badan Ideal (BBI Broca & WHO),
 * BMR/TDEE Mifflin-St Jeor, serta Target Kalori Disesuaikan Menuju Berat Badan Ideal.
 */
export function calculateParentIdealNutrition(params: {
  role: 'ayah' | 'ibu';
  weight: number; // kg
  height: number; // cm
  age: number; // tahun
}): {
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
  calorieStrategy: string;
  explanation: string;
} {
  const { role, weight, height, age } = params;
  const w = Number(weight) || (role === 'ayah' ? 70 : 58);
  const h = Number(height) || (role === 'ayah' ? 170 : 160);
  const a = Number(age) || (role === 'ayah' ? 34 : 32);

  const heightM = h / 100;
  const bmi = heightM > 0 ? Number((w / (heightM * heightM)).toFixed(1)) : 22.0;

  // 1. Kategori BMI (Klasifikasi WHO Asia-Pasifik / Kemenkes RI)
  let bmiCategory: 'kurus' | 'ideal' | 'kelebihan' | 'obesitas' = 'ideal';
  let bmiCategoryLabel = 'Ideal / Normal';
  if (bmi < 18.5) {
    bmiCategory = 'kurus';
    bmiCategoryLabel = 'Kurus / Kurang Berat Badan';
  } else if (bmi <= 22.9) {
    bmiCategory = 'ideal';
    bmiCategoryLabel = 'Ideal / Normal (Asia-Pasifik)';
  } else if (bmi <= 24.9) {
    bmiCategory = 'kelebihan';
    bmiCategoryLabel = 'Kelebihan Berat Badan (Overweight)';
  } else {
    bmiCategory = 'obesitas';
    bmiCategoryLabel = 'Obesitas (Perlu Penurunan)';
  }

  // 2. Berat Badan Ideal (BBI Broca / Kemenkes RI)
  // Ayah (Pria): (TB - 100) - 10%
  // Ibu (Wanita): (TB - 100) - 15%
  const bbiFactor = role === 'ayah' ? 0.9 : 0.85;
  const idealWeightBroca = Number(((h - 100) * bbiFactor).toFixed(1));
  const minIdealWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxIdealWeight = Number((22.9 * heightM * heightM).toFixed(1));
  const weightDiff = Number((w - idealWeightBroca).toFixed(1));

  // 3. BMR (Mifflin-St Jeor) & TDEE (Total Daily Energy Expenditure)
  const bmr =
    role === 'ayah'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
  const tdeeMaintenance = Math.round(bmr * 1.35); // Faktor aktivitas harian 1.35

  // 4. Penyesuaian Kalori Menuju Berat Badan Ideal
  let calorieAdjustment = 0;
  let calorieStrategy = 'Pemeliharaan Berat Badan Ideal';
  let explanation = '';

  if (bmiCategory === 'obesitas') {
    // Defisit terkontrol 400 kkal untuk penurunan bertahap aman ~0.4 kg/minggu
    calorieAdjustment = -400;
    calorieStrategy = 'Defisit Kalori Terkontrol (-400 kkal) Menuju BB Ideal';
    explanation = `Berat saat ini (${w} kg) masuk kategori Obesitas. AI menetapkan target kalori defisit agar berat badan turun bertahap menuju ideal (${idealWeightBroca} kg) tanpa memicu lonjakan asam urat.`;
  } else if (bmiCategory === 'kelebihan') {
    // Defisit moderat 250 kkal
    calorieAdjustment = -250;
    calorieStrategy = 'Defisit Moderat (-250 kkal) Menuju Rentang Ideal';
    explanation = `Berat saat ini (${w} kg) sedikit di atas rentang ideal (${minIdealWeight}-${maxIdealWeight} kg). AI menyetel defisit moderat untuk mengembalikan berat ke zona ideal.`;
  } else if (bmiCategory === 'kurus') {
    // Surplus 350 kkal
    calorieAdjustment = +350;
    calorieStrategy = 'Surplus Sehat (+350 kkal) Menuju BB Ideal';
    explanation = `Berat saat ini (${w} kg) di bawah rentang normal. AI menyetel surplus kalori bergizi agar berat naik menuju ideal (${idealWeightBroca} kg).`;
  } else {
    // Ideal
    calorieAdjustment = 0;
    calorieStrategy = 'Pemeliharaan Keseimbangan Energi Ideal';
    explanation = `Berat saat ini (${w} kg) sudah berada dalam rentang ideal (${minIdealWeight}-${maxIdealWeight} kg). AI menjaga asupan kalori pada tingkat pemeliharaan optimal.`;
  }

  // Batas bawah aman kalori
  const minSafeCalories = role === 'ayah' ? 1500 : 1250;
  const targetCalories = Math.max(minSafeCalories, tdeeMaintenance + calorieAdjustment);

  return {
    bmi,
    bmiCategory,
    bmiCategoryLabel,
    idealWeightBroca,
    idealWeightRange: { min: minIdealWeight, max: maxIdealWeight },
    weightDifference: weightDiff,
    bmr: Math.round(bmr),
    tdeeMaintenance,
    targetCalories,
    calorieAdjustment,
    calorieStrategy,
    explanation,
  };
}

