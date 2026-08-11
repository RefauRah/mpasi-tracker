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
 * Mendapatkan target nutrisi harian dari MPASI berdasarkan usia bayi dalam bulan
 * Referensi: Standar WHO & Angka Kecukupan Gizi (AKG) Kemenkes RI untuk asupan dari makanan pendamping
 */
export function getNutritionTarget(ageInMonths: number): NutritionTarget {
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
  } else if (ageInMonths <= 8) {
    return {
      ageLabel: '6-8 Bulan (Tekstur Saring/Lumat)',
      calories: 200,
      protein: 15,
      carbs: 30,
      fat: 10,
      fiber: 10,
      iron: 10,
      calcium: 260,
    };
  } else if (ageInMonths <= 11) {
    return {
      ageLabel: '9-11 Bulan (Tekstur Cincang/Finger Food)',
      calories: 300,
      protein: 18,
      carbs: 45,
      fat: 12,
      fiber: 11,
      iron: 10,
      calcium: 270,
    };
  } else {
    // 12-24 bulan+
    return {
      ageLabel: '12-23 Bulan (Makanan Keluarga)',
      calories: 550,
      protein: 20,
      carbs: 70,
      fat: 20,
      fiber: 16,
      iron: 7,
      calcium: 650,
    };
  }
}
