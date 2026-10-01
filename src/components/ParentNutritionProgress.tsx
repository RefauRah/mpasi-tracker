'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParentProfile, ParentRole, AITargetAssessment, ParentLabCheck } from '@/lib/types';
import { calculateDailyHealthEstimation } from '@/lib/health-estimation';
import ParentHealthEstimationCard from './ParentHealthEstimationCard';
import {
  Flame,
  Activity,
  Heart,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Brain,
} from 'lucide-react';

interface ParentNutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  cholesterol: number;
  purine: number;
}

interface ParentNutritionProgressProps {
  summary: ParentNutritionSummary;
  profile: ParentProfile;
  role: ParentRole;
  aiAssessment?: AITargetAssessment | null;
  latestLab?: ParentLabCheck | null;
}

export default function ParentNutritionProgress({
  summary,
  profile,
  role,
  aiAssessment,
  latestLab,
}: ParentNutritionProgressProps) {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loadingWater, setLoadingWater] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchWater = useCallback(async () => {
    try {
      const res = await fetch(`/api/parents/water?role=${role}&date=${todayStr}`);
      const data = await res.json();
      setWaterGlasses(Number(data.glasses || 0));
    } catch (err) {
      console.error(err);
    }
  }, [role, todayStr]);

  useEffect(() => {
    fetchWater();
  }, [fetchWater]);

  const handleUpdateWater = async (delta: number) => {
    setLoadingWater(true);
    try {
      const res = await fetch('/api/parents/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, date: todayStr, delta }),
      });
      const data = await res.json();
      if (res.ok) {
        setWaterGlasses(data.glasses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWater(false);
    }
  };

  // Calculations with AI dynamic targets
  const maxCholesterol = aiAssessment?.adjusted_cholesterol_max ?? (profile.target_cholesterol_max || 200);
  const maxPurine = aiAssessment?.adjusted_purine_max ?? (profile.target_purine_max || 400);
  const targetFiber = aiAssessment?.adjusted_fiber_min ?? (profile.target_fiber_min || 25);
  const targetWater = aiAssessment?.adjusted_water_glasses ?? 8;
  const targetCalories = profile.target_calories || (role === 'ayah' ? 2000 : 1700);

  const cholPercent = Math.min(100, Math.round((summary.cholesterol / maxCholesterol) * 100));
  const purinePercent = Math.min(100, Math.round((summary.purine / maxPurine) * 100));
  const fiberPercent = Math.min(100, Math.round((summary.fiber / targetFiber) * 100));
  const calPercent = Math.min(100, Math.round((summary.calories / targetCalories) * 100));

  const isCholesterolSafe = summary.cholesterol <= maxCholesterol;
  const isPurineSafe = summary.purine <= maxPurine;

  const hasAIAdjustment = aiAssessment && aiAssessment.hasLabData;

  const healthEstimation = calculateDailyHealthEstimation({
    role,
    purine_mg: summary.purine,
    cholesterol_mg: summary.cholesterol,
    fiber_g: summary.fiber,
    calories: summary.calories,
    waterGlasses,
    latestLab,
    targetPurineMax: maxPurine,
    targetCholesterolMax: maxCholesterol,
    targetFiberMin: targetFiber,
  });

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
            <Heart size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Target Asupan Harian {profile.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Pantau batas Kolesterol & Purin agar tetap di zona aman
            </p>
          </div>
        </div>
      </div>

      {/* Main KPI Badges: Kolesterol & Asam Urat (Purin) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kolesterol Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCholesterolSafe ? 'bg-amber-50/50 border-amber-200' : 'bg-red-50/70 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Heart size={15} className={isCholesterolSafe ? 'text-amber-600' : 'text-red-600'} />
              Kolesterol
            </span>
            <div className="flex items-center gap-1">
              {hasAIAdjustment && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  AI Lab
                </span>
              )}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isCholesterolSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {isCholesterolSafe ? 'Aman' : 'Melebihi'}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[var(--text-main)]">{summary.cholesterol}</span>
            <span className="text-xs text-[var(--text-muted)]">/ maks {maxCholesterol} mg</span>
          </div>

          <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                cholPercent > 90 ? 'bg-red-500' : cholPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${cholPercent}%` }}
            />
          </div>
        </div>

        {/* Purin (Asam Urat) Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isPurineSafe ? 'bg-blue-50/50 border-blue-200' : 'bg-red-50/70 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Activity size={15} className={isPurineSafe ? 'text-blue-600' : 'text-red-600'} />
              Purin (Asam Urat)
            </span>
            <div className="flex items-center gap-1">
              {hasAIAdjustment && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  AI Lab
                </span>
              )}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isPurineSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {isPurineSafe ? 'Aman' : 'Tinggi'}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[var(--text-main)]">{summary.purine}</span>
            <span className="text-xs text-[var(--text-muted)]">/ maks {maxPurine} mg</span>
          </div>

          <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                purinePercent > 90 ? 'bg-red-500' : purinePercent > 60 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${purinePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Nutrients: Kalori, Serat, Protein, Karbo, Lemak */}
      <div className="space-y-3 pt-1">
        {/* Serat Penurun Kolesterol */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-main)] flex items-center gap-1">
              <Leaf size={14} className="text-emerald-600" />
              Serat Penurun Kolesterol:
            </span>
            <span className="text-[var(--text-muted)]">
              {summary.fiber}g / target {targetFiber}g ({fiberPercent}%)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-secondary)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${fiberPercent}%` }}
            />
          </div>
        </div>

        {/* Total Kalori */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-main)] flex items-center gap-1">
              <Flame size={14} className="text-orange-500" />
              Total Energi / Kalori:
            </span>
            <span className="text-[var(--text-muted)]">
              {summary.calories} / {targetCalories} kkal ({calPercent}%)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-secondary)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            />
          </div>
        </div>

        {/* Macro Mini Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">Protein</span>
            <span className="font-bold text-[var(--text-main)]">{summary.protein}g</span>
          </div>
          <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">Karbohidrat</span>
            <span className="font-bold text-[var(--text-main)]">{summary.carbs}g</span>
          </div>
          <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">Lemak Total</span>
            <span className="font-bold text-[var(--text-main)]">{summary.fat}g</span>
          </div>
        </div>
      </div>

      {/* Water Hydration Tracker (Krusial untuk meluruhkan Asam Urat) */}
      <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500 text-white rounded-xl">
            <Droplets size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sky-950">Hidrasi Air Putih</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-sky-200 text-sky-900">
                {waterGlasses * 250} ml / {targetWater * 250} ml
              </span>
            </div>
            <p className="text-[10px] text-sky-800">
              Target {targetWater} gelas/hari untuk meluruhkan asam urat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleUpdateWater(-1)}
            disabled={loadingWater || waterGlasses <= 0}
            className="w-7 h-7 rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center font-bold disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <span className="font-extrabold text-sm text-sky-900 min-w-[20px] text-center">
            {waterGlasses}
          </span>
          <button
            type="button"
            onClick={() => handleUpdateWater(1)}
            disabled={loadingWater}
            className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center font-bold shadow-sm"
          >
            <Plus size={14} />
          </button>
          </div>
        </div>
      </div>

      {/* Real-time Daily Uric Acid & Cholesterol Health Estimation Card */}
      <ParentHealthEstimationCard estimation={healthEstimation} role={role} />
    </div>
  );
}
