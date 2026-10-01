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

import { ParentSpecialCondition } from './types';

/**
 * Menghitung BMI Asia-Pasifik, Berat Badan Ideal (BBI Broca & WHO),
 * BMR/TDEE Mifflin-St Jeor, serta Target Kalori Disesuaikan Menuju Berat Badan Ideal
 * dengan adaptasi kondisi khusus (misal: Ibu Menyusui, Hamil, dsb).
 */
export function calculateParentIdealNutrition(params: {
  role: 'ayah' | 'ibu';
  weight: number; // kg
  height: number; // cm
  age: number; // tahun
  specialCondition?: ParentSpecialCondition;
  notes?: string;
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
  conditionCaloriesBonus: number;
  conditionWaterBonusGlasses: number;
  conditionAdjustmentLabel: string;
  calorieStrategy: string;
  explanation: string;
} {
  const { role, weight, height, age, specialCondition = 'none' } = params;
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

  // 4. Penyesuaian Kalori Dasar Menuju Berat Badan Ideal
  let baseCalorieAdjustment = 0;
  let calorieStrategy = 'Pemeliharaan Berat Badan Ideal';
  let explanation = '';

  if (bmiCategory === 'obesitas') {
    // Pada ibu menyusui eksklusif, defisit ditekan tidak boleh terlalu ekstrem agar produksi ASI tidak turun
    baseCalorieAdjustment = specialCondition === 'menyusui_eksklusif' ? -200 : -400;
    calorieStrategy = specialCondition === 'menyusui_eksklusif'
      ? 'Defisit Ringan & Nutrisi ASI Terjaga Menuju BB Ideal'
      : 'Defisit Kalori Terkontrol (-400 kkal) Menuju BB Ideal';
    explanation = `Berat saat ini (${w} kg) masuk kategori Obesitas. Target kalori disesuaikan bertahap menuju ideal (${idealWeightBroca} kg) dengan tetap menjaga suplai nutrisi.`;
  } else if (bmiCategory === 'kelebihan') {
    baseCalorieAdjustment = specialCondition === 'menyusui_eksklusif' ? -150 : -250;
    calorieStrategy = specialCondition === 'menyusui_eksklusif'
      ? 'Defisit Sangat Ringan Aman untuk ASI Menuju Ideal'
      : 'Defisit Moderat (-250 kkal) Menuju Rentang Ideal';
    explanation = `Berat saat ini (${w} kg) sedikit di atas rentang ideal (${minIdealWeight}-${maxIdealWeight} kg).`;
  } else if (bmiCategory === 'kurus') {
    baseCalorieAdjustment = +350;
    calorieStrategy = 'Surplus Sehat (+350 kkal) Menuju BB Ideal';
    explanation = `Berat saat ini (${w} kg) di bawah rentang normal. Perlu asupan gizi ekstra agar berat naik menuju ideal (${idealWeightBroca} kg).`;
  } else {
    baseCalorieAdjustment = 0;
    calorieStrategy = 'Pemeliharaan Keseimbangan Energi Ideal';
    explanation = `Berat saat ini (${w} kg) sudah berada dalam rentang ideal (${minIdealWeight}-${maxIdealWeight} kg).`;
  }

  // 5. Penyesuaian Kondisi Khusus (Ibu Menyusui, Hamil, Atlet, dsb)
  let conditionCaloriesBonus = 0;
  let conditionWaterBonusGlasses = 0;
  let conditionAdjustmentLabel = '';

  if (specialCondition === 'menyusui_eksklusif') {
    conditionCaloriesBonus = 450;
    conditionWaterBonusGlasses = 3;
    conditionAdjustmentLabel = 'Ibu Menyusui Eksklusif (0-6 bln: +450 kkal, +3 gelas air)';
    calorieStrategy += ' + Tambahan Kalori Busui (+450 kkal)';
  } else if (specialCondition === 'menyusui_lanjutan') {
    conditionCaloriesBonus = 400;
    conditionWaterBonusGlasses = 2;
    conditionAdjustmentLabel = 'Ibu Menyusui Lanjutan (>6 bln: +400 kkal, +2 gelas air)';
    calorieStrategy += ' + Tambahan Kalori Busui (+400 kkal)';
  } else if (specialCondition === 'hamil') {
    conditionCaloriesBonus = 300;
    conditionWaterBonusGlasses = 2;
    conditionAdjustmentLabel = 'Ibu Hamil (+300 kkal, +2 gelas air)';
    calorieStrategy += ' + Kebutuhan Janin (+300 kkal)';
  } else if (specialCondition === 'atlet_pekerja_keras') {
    conditionCaloriesBonus = 350;
    conditionWaterBonusGlasses = 3;
    conditionAdjustmentLabel = 'Aktivitas Fisik / Beban Kerja Berat (+350 kkal)';
    calorieStrategy += ' + Energi Kerja Fisik (+350 kkal)';
  } else if (specialCondition === 'hipertensi_asam_urat') {
    conditionCaloriesBonus = 0;
    conditionWaterBonusGlasses = 2;
    conditionAdjustmentLabel = 'Fokus Restriksi Asam Urat & Kolesterol (+2 gelas air)';
  } else if (specialCondition === 'lansia_pemulihan') {
    conditionCaloriesBonus = 150;
    conditionWaterBonusGlasses = 1;
    conditionAdjustmentLabel = 'Pemulihan Stamina Tubuh (+150 kkal)';
  }

  const totalCalorieAdjustment = baseCalorieAdjustment + conditionCaloriesBonus;

  // Batas bawah aman kalori
  const minSafeCalories = role === 'ayah' ? 1500 : (specialCondition.startsWith('menyusui') ? 1600 : 1250);
  const targetCalories = Math.max(minSafeCalories, tdeeMaintenance + totalCalorieAdjustment);

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
    calorieAdjustment: totalCalorieAdjustment,
    conditionCaloriesBonus,
    conditionWaterBonusGlasses,
    conditionAdjustmentLabel,
    calorieStrategy,
    explanation,
  };
}

