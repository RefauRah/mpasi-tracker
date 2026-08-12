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
