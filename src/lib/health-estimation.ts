import {
  ParentRole,
  ParentLabCheck,
  ParentDailyHealthEstimation,
  MetricEstimation,
} from './types';

interface DailyIntakeParams {
  role: ParentRole;
  purine_mg: number;
  cholesterol_mg: number;
  fiber_g: number;
  calories: number;
  waterGlasses: number;
  latestLab?: ParentLabCheck | null;
  targetPurineMax?: number;
  targetCholesterolMax?: number;
  targetFiberMin?: number;
}

/**
 * Calculates the estimated impact of daily dietary intake and hydration
 * on blood Uric Acid (Asam Urat) and Total Cholesterol levels.
 */
export function calculateDailyHealthEstimation(params: DailyIntakeParams): ParentDailyHealthEstimation {
  const {
    role,
    purine_mg,
    cholesterol_mg,
    fiber_g,
    waterGlasses,
    latestLab,
    targetPurineMax = role === 'ayah' ? 400 : 350,
    targetCholesterolMax = 200,
    targetFiberMin = role === 'ayah' ? 28 : 25,
  } = params;

  const hasLab = !!latestLab && latestLab.uric_acid > 0 && latestLab.total_cholesterol > 0;
  const baselineDate = latestLab?.date;

  // 1. URIC ACID ESTIMATION
  const baselineUric = hasLab && latestLab ? Number(latestLab.uric_acid) : (role === 'ayah' ? 6.5 : 5.5);
  const uricNormalMax = role === 'ayah' ? 7.0 : 6.0;

  // Purine impact factor:
  // Baseline normal purine intake generates ~15% of daily circulating uric acid pool
  let uricDelta = 0;
  let uricReason = '';

  if (purine_mg === 0) {
    // No food yet or zero purine logged
    if (waterGlasses >= 6) {
      uricDelta = -0.15;
      uricReason = 'Hidrasi cukup membantu ekskresi ginjal sebelum asupan purin bertambah.';
    } else {
      uricDelta = 0;
      uricReason = 'Belum ada catatan asupan purin hari ini.';
    }
  } else if (purine_mg <= targetPurineMax * 0.5) {
    // Very low purine intake (< 50% of max)
    const clearanceBonus = waterGlasses >= 8 ? 0.35 : waterGlasses >= 6 ? 0.25 : 0.15;
    uricDelta = -clearanceBonus;
    uricReason = `Asupan purin sangat rendah (${purine_mg} mg) didukung ${waterGlasses} gelas air mempercepat peluruhan asam urat.`;
  } else if (purine_mg <= targetPurineMax) {
    // Within safe threshold
    const clearance = waterGlasses >= 8 ? 0.2 : waterGlasses >= 6 ? 0.1 : 0.0;
    uricDelta = -clearance;
    uricReason = `Asupan purin terkontrol aman (${purine_mg} / ${targetPurineMax} mg) menjaga kestabilan asam urat.`;
  } else {
    // Exceeded purine threshold
    const excess = purine_mg - targetPurineMax;
    // Each 100mg excess purine contributes ~ +0.15 to +0.25 mg/dL surge
    let increase = (excess / 100) * 0.2;
    // High hydration mitigates surge by up to 30%
    if (waterGlasses >= 8) {
      increase *= 0.7;
    } else if (waterGlasses < 4) {
      increase *= 1.25; // Dehydration concentrates uric acid in plasma
    }
    uricDelta = Math.min(1.5, increase);
    uricReason = `Asupan purin berlebih (${purine_mg} mg, batas ${targetPurineMax} mg) memicu peningkatan sintesis asam urat.`;
  }

  const estimatedUric = Math.max(2.5, Number((baselineUric + uricDelta).toFixed(2)));
  const uricDiff = Number((estimatedUric - baselineUric).toFixed(2));
  const uricPct = Number((((estimatedUric - baselineUric) / baselineUric) * 100).toFixed(1));

  let uricTrend: 'turun' | 'naik' | 'stabil' = 'stabil';
  if (uricPct <= -0.5) uricTrend = 'turun';
  else if (uricPct >= 0.5) uricTrend = 'naik';

  let uricStatus: 'normal' | 'waspada' | 'tinggi' = 'normal';
  if (estimatedUric >= uricNormalMax + 0.8) uricStatus = 'tinggi';
  else if (estimatedUric >= uricNormalMax) uricStatus = 'waspada';

  const uricEstimation: MetricEstimation = {
    baseline: baselineUric,
    estimated: estimatedUric,
    diff: uricDiff,
    change_pct: uricPct,
    trend: uricTrend,
    status: uricStatus,
    reason: uricReason,
  };

  // 2. CHOLESTEROL ESTIMATION
  const baselineChol = hasLab && latestLab ? Number(latestLab.total_cholesterol) : 195;
  let cholDelta = 0;
  let cholReason = '';

  // Dietary cholesterol and soluble fiber interaction
  if (cholesterol_mg === 0) {
    if (fiber_g >= 15) {
      cholDelta = -4;
      cholReason = 'Asupan serat mengikat asam empedu & melancarkan eliminasi kolesterol.';
    } else {
      cholDelta = 0;
      cholReason = 'Belum ada catatan asupan kolesterol makanan hari ini.';
    }
  } else if (cholesterol_mg <= targetCholesterolMax * 0.6) {
    // Very low dietary cholesterol
    const fiberBonus = fiber_g >= targetFiberMin ? 8 : fiber_g >= 15 ? 5 : 2;
    cholDelta = -fiberBonus;
    cholReason = `Diet rendah kolesterol (${cholesterol_mg} mg) dan serat ${fiber_g}g efektif menurunkan kadar kolesterol.`;
  } else if (cholesterol_mg <= targetCholesterolMax) {
    // Within safe threshold
    const fiberBonus = fiber_g >= targetFiberMin ? 4 : 0;
    cholDelta = -fiberBonus;
    cholReason = `Kolesterol makanan aman di bawah ${targetCholesterolMax} mg, kadar relatif terjaga stabil.`;
  } else {
    // Exceeded cholesterol threshold
    const excess = cholesterol_mg - targetCholesterolMax;
    // Each 100mg excess cholesterol contributes +4 to +8 mg/dL
    let increase = (excess / 100) * 6;
    if (fiber_g >= targetFiberMin) {
      increase *= 0.75; // Fiber cushions cholesterol uptake
    }
    cholDelta = Math.min(35, Math.round(increase));
    cholReason = `Asupan kolesterol melampaui batas (${cholesterol_mg} mg, batas ${targetCholesterolMax} mg) meningkatkan kolesterol sirkulasi.`;
  }

  const estimatedChol = Math.max(90, Math.round(baselineChol + cholDelta));
  const cholDiff = Math.round(estimatedChol - baselineChol);
  const cholPct = Number((((estimatedChol - baselineChol) / baselineChol) * 100).toFixed(1));

  let cholTrend: 'turun' | 'naik' | 'stabil' = 'stabil';
  if (cholPct <= -0.5) cholTrend = 'turun';
  else if (cholPct >= 0.5) cholTrend = 'naik';

  let cholStatus: 'normal' | 'waspada' | 'tinggi' = 'normal';
  if (estimatedChol >= 240) cholStatus = 'tinggi';
  else if (estimatedChol >= 200) cholStatus = 'waspada';

  const cholEstimation: MetricEstimation = {
    baseline: baselineChol,
    estimated: estimatedChol,
    diff: cholDiff,
    change_pct: cholPct,
    trend: cholTrend,
    status: cholStatus,
    reason: cholReason,
  };

  // General advice summary
  let advice = '';
  if (uricTrend === 'turun' && cholTrend === 'turun') {
    advice = 'Pilihan makanan & hidrasi hari ini sangat baik! Asam urat dan kolesterol diproyeksikan menurun secara positif.';
  } else if (uricTrend === 'naik' || cholTrend === 'naik') {
    advice = 'Perhatikan asupan sisa hari ini: perbanyak air putih, sayuran tinggi serat pengikat, serta hindari jeroan/gorengan.';
  } else {
    advice = 'Kondisi nutrisi hari ini stabil. Tetap pertahankan pola makan seimbang dan cukupi kebutuhan cairan.';
  }

  return {
    uric_acid: uricEstimation,
    cholesterol: cholEstimation,
    hasLabBaseline: hasLab,
    baselineDate,
    advice,
  };
}
